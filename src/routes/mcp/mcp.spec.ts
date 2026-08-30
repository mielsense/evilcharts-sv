import { describe, expect, it } from 'vitest';
import { POST } from './+server.js';

type JsonRpcBody = Record<string, unknown>;

async function call(body: JsonRpcBody | string) {
	const request = new Request('http://localhost/mcp', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: typeof body === 'string' ? body : JSON.stringify(body)
	});
	const response = await POST({ request } as Parameters<typeof POST>[0]);
	return { response, body: response.status === 202 ? null : await response.json() };
}

describe('MCP JSON-RPC endpoint', () => {
	it('returns parse and request errors without throwing a server error', async () => {
		const malformed = await call('{');
		expect(malformed.response.status).toBe(200);
		expect(malformed.body).toMatchObject({ error: { code: -32700 } });

		const invalid = await call({ jsonrpc: '1.0', id: 1, method: 'tools/list' });
		expect(invalid.response.status).toBe(200);
		expect(invalid.body).toMatchObject({ id: 1, error: { code: -32600 } });
	});

	it('rejects non-finite numeric IDs without losing response correlation', async () => {
		const invalid = await call('{"jsonrpc":"2.0","id":1e400,"method":"initialize"}');

		expect(invalid.response.status).toBe(200);
		expect(invalid.body).toEqual({
			jsonrpc: '2.0',
			id: null,
			error: { code: -32600, message: 'Invalid Request' }
		});
	});

	it('rejects missing, mistyped, and oversized tool arguments', async () => {
		for (const body of [
			{
				jsonrpc: '2.0',
				id: 1,
				method: 'tools/call',
				params: { name: 'read_doc', arguments: { path: 4 } }
			},
			{
				jsonrpc: '2.0',
				id: 2,
				method: 'tools/call',
				params: { name: 'search_docs', arguments: { query: 'x'.repeat(201) } }
			}
		]) {
			const result = await call(body);
			expect(result.response.status).toBe(200);
			expect(result.body).toMatchObject({ error: { code: -32602 } });
		}
	});

	it('returns constant errors without reflecting unknown methods, tools, or paths', async () => {
		const marker = 'untrusted-marker';
		const requests = [
			{
				body: { jsonrpc: '2.0', id: 1, method: marker },
				code: -32601,
				message: 'Method not found'
			},
			{
				body: {
					jsonrpc: '2.0',
					id: 2,
					method: 'tools/call',
					params: { name: marker, arguments: {} }
				},
				code: -32602,
				message: 'Unknown tool'
			},
			{
				body: {
					jsonrpc: '2.0',
					id: 3,
					method: 'tools/call',
					params: { name: 'read_doc', arguments: { path: `/docs/${marker}` } }
				},
				code: -32602,
				message: 'Documentation page not found'
			}
		];

		for (const request of requests) {
			const result = await call(request.body);
			expect(result.body).toMatchObject({
				error: { code: request.code, message: request.message }
			});
			expect(JSON.stringify(result.body)).not.toContain(marker);
		}
	});

	it('accepts bounded method, string ID, tool name, and read path values at their limits', async () => {
		const id = 'i'.repeat(128);
		const initialized = await call({ jsonrpc: '2.0', id, method: 'initialize' });
		expect(initialized.body).toEqual({
			jsonrpc: '2.0',
			id,
			result: {
				protocolVersion: '2025-06-18',
				capabilities: { tools: {} },
				serverInfo: { name: 'evilcharts-docs', version: '1.0.0' }
			}
		});

		const search = await call({
			jsonrpc: '2.0',
			id: 2,
			method: 'tools/call',
			params: { name: 'search_docs', arguments: { query: 'Sankey chart' } }
		});
		expect(search.body).toMatchObject({ id: 2, result: { content: [{ type: 'text' }] } });

		const path = `${' '.repeat(251)}/docs`;
		expect(path).toHaveLength(256);
		const read = await call({
			jsonrpc: '2.0',
			id: 3,
			method: 'tools/call',
			params: { name: 'read_doc', arguments: { path } }
		});
		expect(read.body).toMatchObject({ id: 3, result: { content: [{ type: 'text' }] } });
	});

	it('rejects bounded envelope strings above their limits without reflection', async () => {
		const marker = 'oversized-marker';
		const requests = [
			{
				body: { jsonrpc: '2.0', id: 1, method: marker },
				code: -32601,
				message: 'Method not found'
			},
			{
				body: { jsonrpc: '2.0', id: marker.repeat(9), method: 'initialize' },
				code: -32600,
				message: 'Invalid Request'
			},
			{
				body: {
					jsonrpc: '2.0',
					id: 3,
					method: 'tools/call',
					params: { name: marker, arguments: {} }
				},
				code: -32602,
				message: 'Unknown tool'
			},
			{
				body: {
					jsonrpc: '2.0',
					id: 4,
					method: 'tools/call',
					params: { name: 'read_doc', arguments: { path: marker.repeat(17) } }
				},
				code: -32602,
				message: 'Invalid read_doc path'
			}
		];

		for (const request of requests) {
			const result = await call(request.body);
			expect(result.body).toMatchObject({
				error: { code: request.code, message: request.message }
			});
			expect(JSON.stringify(result.body)).not.toContain(marker);
		}
	});

	it('keeps successful initialize and tools/list payloads unchanged', async () => {
		const initialized = await call({ jsonrpc: '2.0', id: 1, method: 'initialize' });
		expect(initialized.body).toEqual({
			jsonrpc: '2.0',
			id: 1,
			result: {
				protocolVersion: '2025-06-18',
				capabilities: { tools: {} },
				serverInfo: { name: 'evilcharts-docs', version: '1.0.0' }
			}
		});

		const listed = await call({ jsonrpc: '2.0', id: 2, method: 'tools/list' });
		expect(listed.body).toEqual({
			jsonrpc: '2.0',
			id: 2,
			result: {
				tools: [
					{
						name: 'search_docs',
						description:
							'Search EvilCharts documentation pages by title, description, and content.',
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
				]
			}
		});
	});

	it('keeps representative search ranking and document content unchanged', async () => {
		const search = await call({
			jsonrpc: '2.0',
			id: 3,
			method: 'tools/call',
			params: { name: 'search_docs', arguments: { query: 'EvilSankeyChart isClickable' } }
		});
		expect(search.response.status).toBe(200);
		const searchResults = JSON.parse(search.body.result.content[0].text) as Array<{
			title: string;
			url: string;
			markdownUrl: string;
		}>;
		expect(searchResults[0]).toMatchObject({
			title: 'Sankey Chart',
			url: 'https://evilcharts-sv.vercel.app/docs/layerchart/sankey-chart',
			markdownUrl: 'https://evilcharts-sv.vercel.app/docs/layerchart/sankey-chart.md'
		});

		const read = await call({
			jsonrpc: '2.0',
			id: 4,
			method: 'tools/call',
			params: { name: 'read_doc', arguments: { path: '/docs/layerchart/sankey-chart' } }
		});
		expect(read.response.status).toBe(200);
		const document = read.body.result.content[0].text as string;
		expect(document).toContain('# Sankey Chart');
		expect(document).toContain(
			'Source: https://evilcharts-sv.vercel.app/docs/layerchart/sankey-chart'
		);
		expect(document).toContain('## Installation');
		expect(document).toContain('EvilSankeyChart');
	});

	it('keeps notifications response-free even for an oversized method', async () => {
		const result = await call({ jsonrpc: '2.0', method: 'oversized-method-marker' });

		expect(result.response.status).toBe(202);
		expect(result.body).toBeNull();
	});

	it('returns a controlled error for an unknown documentation path', async () => {
		const result = await call({
			jsonrpc: '2.0',
			id: 'missing-doc',
			method: 'tools/call',
			params: { name: 'read_doc', arguments: { path: '/docs/not-real' } }
		});

		expect(result.response.status).toBe(200);
		expect(result.body).toMatchObject({
			id: 'missing-doc',
			error: { code: -32602, message: 'Documentation page not found' }
		});
	});

	it('keeps valid tool calls and notifications working', async () => {
		const search = await call({
			jsonrpc: '2.0',
			id: 3,
			method: 'tools/call',
			params: { name: 'search_docs', arguments: { query: 'Sankey chart' } }
		});
		expect(search.response.status).toBe(200);
		expect(search.body).toMatchObject({ id: 3, result: { content: [{ type: 'text' }] } });

		const notification = await call({ jsonrpc: '2.0', method: 'tools/list' });
		expect(notification.response.status).toBe(202);
		expect(notification.body).toBeNull();
	});
});
