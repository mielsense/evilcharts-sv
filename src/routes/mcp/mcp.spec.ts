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
			error: { code: -32602, message: 'No documentation page found for path: /docs/not-real' }
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
