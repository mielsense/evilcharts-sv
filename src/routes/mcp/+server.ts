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
	jsonrpc?: '2.0';
	id?: string | number | null;
	method?: string;
	params?: {
		name?: string;
		arguments?: Record<string, unknown>;
	};
};

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
	return json(
		{ jsonrpc: '2.0', id, error: { code, message } },
		{ status: code === -32601 ? 404 : 400 }
	);
}

function getPageByPath(path: string) {
	const normalized = path.replace(/\.md$/, '').replace(/\/$/, '') || '/docs';
	const slug = normalized
		.replace(/^\/docs\/?/, '')
		.split('/')
		.filter(Boolean);
	const pages = getAgentDocPages();

	return (
		pages.find((page) => page.url === normalized) ??
		pages.find((page) => page.slugs.join('/') === slug.join('/'))
	);
}

function readDoc(path: string) {
	const page = getPageByPath(path);
	if (!page) throw new Error(`No documentation page found for path: ${path}`);

	const markdown = processMdxForLLMs(page.body).trim();

	return `# ${page.data.title}

${page.data.description ? `> ${page.data.description}\n\n` : ''}Source: ${absoluteUrl(page.url)}

${markdown}`;
}

function searchDocs(query: string) {
	const terms = query.toLowerCase().split(/\s+/).filter(Boolean);

	return getAgentDocPages()
		.map((page) => {
			const markdown = processMdxForLLMs(page.body);
			const haystack = [page.data.title, page.data.description, markdown].join(' ').toLowerCase();
			const score = terms.reduce((total, term) => total + (haystack.includes(term) ? 1 : 0), 0);

			return { page, score, snippet: markdown.replace(/\s+/g, ' ').slice(0, 240) };
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
	const args = request.params?.arguments ?? {};

	if (name === 'search_docs') {
		const query = typeof args.query === 'string' ? args.query : '';
		const results = query ? searchDocs(query) : [];

		return jsonRpcResult(request.id, {
			content: [{ type: 'text', text: JSON.stringify(results, null, 2) }]
		});
	}

	if (name === 'read_doc') {
		const path = typeof args.path === 'string' ? args.path : '';
		return jsonRpcResult(request.id, { content: [{ type: 'text', text: readDoc(path) }] });
	}

	return jsonRpcError(request.id, -32602, `Unknown tool: ${name ?? 'missing'}`);
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
	const body = (await request.json()) as JsonRpcRequest;

	// A notification (no id) gets an acknowledgement and nothing else.
	if (body.id === undefined || body.id === null) return new Response(null, { status: 202 });

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
			return jsonRpcError(body.id, -32601, `Method not found: ${body.method ?? 'missing'}`);
	}
};
