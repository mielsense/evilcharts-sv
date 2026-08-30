import { expect, test } from '@playwright/test';

test('advertised agent documentation endpoints work through HTTP', async ({ request }) => {
	for (const [path, expected] of [
		['/llms.txt', '/docs/agent-skill'],
		['/llms-full.txt', '# Agent Skill']
	] as const) {
		const response = await request.get(path);
		expect(response.status(), path).toBe(200);
		expect(response.headers()['content-type'], path).toContain('text/plain');
		expect(await response.text(), path).toContain(expected);
	}

	for (const path of ['/docs/agent-skill.md', '/docs/agent-skill'] as const) {
		const response = await request.get(path, {
			headers: { Accept: 'text/markdown' }
		});
		expect(response.status(), path).toBe(200);
		expect(response.headers()['content-type'], path).toContain('text/markdown');
		expect(await response.text(), path).toContain('## Install the agent skill');
	}

	const missing = await request.get('/docs/not-a-real-evilcharts-page.md');
	expect(missing.status()).toBe(404);
});

test('the MCP descriptor and representative calls work through HTTP', async ({ request }) => {
	const descriptor = await request.get('/mcp');
	expect(descriptor.status()).toBe(200);
	expect(descriptor.headers()['content-type']).toContain('application/json');
	expect(await descriptor.json()).toMatchObject({
		name: 'evilcharts-docs',
		transport: 'streamable-http',
		tools: [{ name: 'search_docs' }, { name: 'read_doc' }]
	});

	const initialized = await request.post('/mcp', {
		data: { jsonrpc: '2.0', id: 1, method: 'initialize' }
	});
	expect(initialized.status()).toBe(200);
	expect(initialized.headers()['content-type']).toContain('application/json');
	expect(await initialized.json()).toMatchObject({
		jsonrpc: '2.0',
		id: 1,
		result: { serverInfo: { name: 'evilcharts-docs' } }
	});

	const listed = await request.post('/mcp', {
		data: { jsonrpc: '2.0', id: 2, method: 'tools/list' }
	});
	expect(listed.status()).toBe(200);
	expect(await listed.json()).toMatchObject({
		id: 2,
		result: { tools: [{ name: 'search_docs' }, { name: 'read_doc' }] }
	});

	const read = await request.post('/mcp', {
		data: {
			jsonrpc: '2.0',
			id: 3,
			method: 'tools/call',
			params: {
				name: 'read_doc',
				arguments: { path: '/docs/agent-skill' }
			}
		}
	});
	expect(read.status()).toBe(200);
	const readBody = await read.json();
	expect(readBody).toMatchObject({ id: 3, result: { content: [{ type: 'text' }] } });
	expect(readBody.result.content[0].text).toContain('# Agent Skill');
});
