import { expect, test } from '@playwright/test';

const CANONICAL_SKILL = '/.well-known/agent-skills/evilcharts-svelte/SKILL.md';
const SKILL_ENDPOINTS = [
	CANONICAL_SKILL,
	'/.well-known/skills/evilcharts-svelte/skill.md',
	'/skill.md',
	'/.well-known/agent-skills/evilcharts/SKILL.md',
	'/.well-known/skills/evilcharts/skill.md'
];

test('both discovery indexes advertise the canonical skill and both providers', async ({
	request
}) => {
	const agentResponse = await request.get('/.well-known/agent-skills/index.json');
	expect(agentResponse.status()).toBe(200);
	expect(agentResponse.headers()['content-type']).toContain('application/json');
	expect(await agentResponse.json()).toEqual({
		$schema: 'https://schemas.agentskills.io/discovery/0.2.0/schema.json',
		skills: [
			{
				name: 'evilcharts-svelte',
				type: 'skill-md',
				description:
					'Add and customize EvilCharts chart components in Svelte projects using LayerChart or ECharts.',
				url: CANONICAL_SKILL
			}
		]
	});

	const legacyResponse = await request.get('/.well-known/skills/index.json');
	expect(legacyResponse.status()).toBe(200);
	expect(legacyResponse.headers()['content-type']).toContain('application/json');
	expect(await legacyResponse.json()).toEqual({
		skills: [
			{
				name: 'evilcharts-svelte',
				description:
					'Add and customize EvilCharts chart components in Svelte projects using LayerChart or ECharts.',
				files: ['skill.md']
			}
		]
	});
});

test('canonical and compatibility skill endpoints serve the same Markdown body', async ({
	request
}) => {
	const canonicalResponse = await request.get(CANONICAL_SKILL);
	expect(canonicalResponse.status()).toBe(200);
	expect(canonicalResponse.headers()['content-type']).toContain('text/markdown');
	const canonicalBody = await canonicalResponse.text();
	expect(canonicalBody).toContain('name: evilcharts-svelte');

	for (const endpoint of SKILL_ENDPOINTS.slice(1)) {
		const response = await request.get(endpoint);
		expect(response.status(), endpoint).toBe(200);
		expect(response.headers()['content-type'], endpoint).toContain('text/markdown');
		expect(await response.text(), endpoint).toBe(canonicalBody);
	}
});
