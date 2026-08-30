import { json } from '@sveltejs/kit';
import { getAgentDocPages } from '$site/lib/agent-docs.js';
import { processMdxForLLMs } from '$site/lib/llm.js';
import { absoluteUrl } from '$site/lib/utils.js';
import type { RequestHandler } from './$types.js';

/**
 * Ported from `evilcharts/src/app/mcp/route.ts`: same tool names, same input schemas, same
 * JSON-RPC method names and error codes.
 *
 * `GET` is prerendered as the reference's `dynamic = 'force-static'` is; `POST` cannot be, so the
 * route as a whole is left dynamic and the descriptor is computed per request — it is a handful of
 * string literals.
 */
type JsonRpcRequest = {
	jsonrpc: '2.0';
	id?: string | number | null;
	method: string;
	params?: {
		name?: string;
		arguments?: Record<string, unknown>;
	};
};

const MAX_QUERY_LENGTH = 200;
const MAX_QUERY_TERMS = 20;
const MAX_METHOD_LENGTH = 10;
const MAX_STRING_ID_LENGTH = 128;
const MAX_TOOL_NAME_LENGTH = 11;
const MAX_READ_DOC_PATH_LENGTH = 256;

const agentDocs = getAgentDocPages();
const searchCorpus = agentDocs.map((page) => {
	const markdown = processMdxForLLMs(page.body).trim();
	return {
		page,
		markdown,
		haystack: [page.data.title, page.data.description, markdown].join(' ').toLowerCase(),
		snippet: markdown.replace(/\s+/g, ' ').slice(0, 240)
	};
});
const markdownByUrl = new Map(searchCorpus.map(({ page, markdown }) => [page.url, markdown]));

const tools = [
	{
		name: 'search_docs',
		description: 'Search EvilCharts documentation pages by title, description, and content.',
		inputSchema: {
			type: 'object',
			properties: {
				query: {
					type: 'string',
					description: 'Search terms to match against the documentation.'
				}
			},
			required: ['query']
		}
	},
	{
		name: 'read_doc',
		description: 'Read one EvilCharts documentation page as markdown.',
		inputSchema: {
			type: 'object',
			properties: {
				path: {
					type: 'string',
					description: 'Documentation path, for example /docs/layerchart/bar-chart.'
				}
			},
			required: ['path']
		}
	}
];

function jsonRpcResult(id: JsonRpcRequest['id'], result: unknown) {
	return json({ jsonrpc: '2.0', id, result });
}

function jsonRpcError(id: JsonRpcRequest['id'], code: number, message: string) {
	return json({ jsonrpc: '2.0', id: id ?? null, error: { code, message } });
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function requestId(value: unknown): JsonRpcRequest['id'] {
	if (!isRecord(value)) return null;
	if (typeof value.id === 'string') {
		return value.id.length <= MAX_STRING_ID_LENGTH ? value.id : null;
	}
	return typeof value.id === 'number' || value.id === null ? value.id : null;
}

function isJsonRpcRequest(value: unknown): value is JsonRpcRequest {
	if (!isRecord(value) || value.jsonrpc !== '2.0' || typeof value.method !== 'string') return false;
	if (
		value.id !== undefined &&
		value.id !== null &&
		typeof value.id !== 'string' &&
		typeof value.id !== 'number'
	) {
		return false;
	}
	if (typeof value.id === 'string' && value.id.length > MAX_STRING_ID_LENGTH) return false;
	return value.params === undefined || isRecord(value.params);
}

function getPageByPath(path: string) {
	const normalized = path.replace(/\.md$/, '').replace(/\/$/, '') || '/docs';
	const slug = normalized
		.replace(/^\/docs\/?/, '')
		.split('/')
		.filter(Boolean);
	return (
		agentDocs.find((page) => page.url === normalized) ??
		agentDocs.find((page) => page.slugs.join('/') === slug.join('/'))
	);
}

function readDoc(path: string) {
	const page = getPageByPath(path);
	if (!page) throw new Error('Documentation page not found');

	const markdown = markdownByUrl.get(page.url) ?? '';

	return `# ${page.data.title}

${page.data.description ? `> ${page.data.description}\n\n` : ''}Source: ${absoluteUrl(page.url)}

${markdown}`;
}

function searchDocs(query: string) {
	const terms = query.toLowerCase().split(/\s+/).filter(Boolean);

	return searchCorpus
		.map(({ page, haystack, snippet }) => {
			const score = terms.reduce((total, term) => total + (haystack.includes(term) ? 1 : 0), 0);
			return { page, score, snippet };
		})
		.filter((result) => result.score > 0)
		.sort((a, b) => b.score - a.score)
		.slice(0, 10)
		.map(({ page, snippet }) => ({
			title: page.data.title,
			description: page.data.description,
			url: absoluteUrl(page.url),
			markdownUrl: absoluteUrl(page.url === '/docs' ? '/docs.md' : `${page.url}.md`),
			snippet
		}));
}

function handleToolCall(request: JsonRpcRequest) {
	const name = request.params?.name;
	const args = request.params?.arguments;
	if (typeof name !== 'string' || !isRecord(args)) {
		return jsonRpcError(request.id, -32602, 'tools/call requires a tool name and arguments object');
	}
	if (name.length > MAX_TOOL_NAME_LENGTH) {
		return jsonRpcError(request.id, -32602, 'Unknown tool');
	}

	if (name === 'search_docs') {
		if (typeof args.query !== 'string' || args.query.trim().length === 0) {
			return jsonRpcError(request.id, -32602, 'search_docs requires a non-empty query string');
		}
		const query = args.query.trim();
		const terms = query.split(/\s+/).filter(Boolean);
		if (query.length > MAX_QUERY_LENGTH || terms.length > MAX_QUERY_TERMS) {
			return jsonRpcError(
				request.id,
				-32602,
				`search_docs accepts at most ${MAX_QUERY_LENGTH} characters and ${MAX_QUERY_TERMS} terms`
			);
		}
		const results = searchDocs(query);

		return jsonRpcResult(request.id, {
			content: [{ type: 'text', text: JSON.stringify(results, null, 2) }]
		});
	}

	if (name === 'read_doc') {
		if (typeof args.path !== 'string') {
			return jsonRpcError(request.id, -32602, 'read_doc requires a non-empty path string');
		}
		if (args.path.length > MAX_READ_DOC_PATH_LENGTH) {
			return jsonRpcError(request.id, -32602, 'Invalid read_doc path');
		}
		const path = args.path.trim();
		if (path.length === 0) {
			return jsonRpcError(request.id, -32602, 'read_doc requires a non-empty path string');
		}
		try {
			return jsonRpcResult(request.id, { content: [{ type: 'text', text: readDoc(path) }] });
		} catch {
			return jsonRpcError(request.id, -32602, 'Documentation page not found');
		}
	}

	return jsonRpcError(request.id, -32602, 'Unknown tool');
}

export const GET: RequestHandler = () =>
	json({
		name: 'evilcharts-docs',
		description: 'MCP endpoint for searching and reading EvilCharts documentation.',
		protocolVersion: '2025-06-18',
		transport: 'streamable-http',
		url: absoluteUrl('/mcp'),
		tools: tools.map(({ name, description }) => ({ name, description }))
	});

export const POST: RequestHandler = async ({ request }) => {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return jsonRpcError(null, -32700, 'Parse error');
	}

	if (!isJsonRpcRequest(body)) {
		return jsonRpcError(requestId(body), -32600, 'Invalid Request');
	}

	// A notification (no id) gets an acknowledgement and nothing else.
	if (body.id === undefined) return new Response(null, { status: 202 });
	if (body.method.length > MAX_METHOD_LENGTH) {
		return jsonRpcError(body.id, -32601, 'Method not found');
	}

	switch (body.method) {
		case 'initialize':
			return jsonRpcResult(body.id, {
				protocolVersion: '2025-06-18',
				capabilities: { tools: {} },
				serverInfo: { name: 'evilcharts-docs', version: '1.0.0' }
			});
		case 'tools/list':
			return jsonRpcResult(body.id, { tools });
		case 'tools/call':
			return handleToolCall(body);
		default:
			return jsonRpcError(body.id, -32601, 'Method not found');
	}
};
