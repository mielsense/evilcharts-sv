import { describe, expect, it } from 'vitest';
import {
	generateLlmsFullTxt,
	generateLlmsTxt,
	generateSkillMd,
	getAgentDocPages,
	getAgentSkillsIndex
} from './agent-docs.js';
import { PROVIDERS, PROVIDER_META } from '$site/globals/constants/providers.js';
import { getPages } from './source.js';
import { absoluteUrl, SITE_URL } from './utils.js';

const available = PROVIDERS.filter((id) => PROVIDER_META[id].available);

describe('getAgentDocPages', () => {
	it('lists the shared pages plus every available provider, and nothing else', () => {
		const urls = getAgentDocPages().map((page) => page.url);

		expect(urls).toContain('/docs');
		expect(urls).toContain('/docs/chart-config');
		for (const url of urls) {
			const shared = ['/docs', '/docs/chart-config', '/docs/changelog'].includes(url);
			const inProvider = available.some((id) => url.startsWith(`/docs/${id}/`));
			expect(shared || inProvider, url).toBe(true);
		}
	});

	it('omits a provider that is not marked available', () => {
		const unavailable = PROVIDERS.filter((id) => !PROVIDER_META[id].available);
		const urls = getAgentDocPages().map((page) => page.url);
		// With every shipped provider available this list is empty, which is itself the guarantee:
		// nothing unpublished can reach the agent surface.
		expect(unavailable.filter((id) => urls.some((url) => url.startsWith(`/docs/${id}/`)))).toEqual(
			[]
		);
	});

	it('covers every page the docs site publishes', () => {
		// With one available provider, the agent surface is the whole tree.
		expect(getAgentDocPages()).toHaveLength(getPages().length);
	});
});

describe('generateLlmsTxt', () => {
	const text = generateLlmsTxt();

	it('opens with the index heading and the Start Here block', () => {
		expect(text.startsWith('# EvilCharts Documentation')).toBe(true);
		expect(text).toContain('## Start Here');
		expect(text).toContain(`](${absoluteUrl('/docs.md')})`);
	});

	it('groups each provider into Setup, Chart Components and UI Components', () => {
		for (const id of available) {
			expect(text).toContain(`## ${PROVIDER_META[id].name}`);
			expect(text).toContain(`/r/${id}-{chart-name}.json`);
		}
		expect(text).toContain('### Setup');
		expect(text).toContain('### Chart Components');
		expect(text).toContain('### UI Components');
	});

	it("lists every provider's eight charts and UI pages", () => {
		const charts = [
			'area-chart',
			'line-chart',
			'bar-chart',
			'composed-chart',
			'radar-chart',
			'pie-chart',
			'radial-chart',
			'sankey-chart'
		];
		for (const id of available) {
			for (const chart of charts) {
				expect(text, `${id}/${chart}`).toContain(`/docs/${id}/${chart}.md`);
			}
		}
		for (const id of available) {
			const expectedUi =
				id === 'layerchart'
					? ['background', 'tooltip', 'legend', 'dots', 'brush']
					: ['tooltip', 'legend', 'dots', 'brush'];
			for (const ui of expectedUi) {
				expect(text, `${id}/${ui}`).toContain(`/docs/${id}/ui/${ui}.md`);
			}
		}
	});

	it('links every URL absolutely, because agents read it detached from the site', () => {
		for (const [, url] of text.matchAll(/\]\(([^)]+)\)/g)) {
			expect(url.startsWith(SITE_URL), url).toBe(true);
		}
	});

	it('points at the other agent surfaces', () => {
		expect(text).toContain('/llms-full.txt');
		expect(text).toContain('/skill.md');
		expect(text).toContain('/mcp');
	});

	it('distinguishes the Svelte porter from the original author', () => {
		expect(text).toContain('Svelte 5 port by Mathis');
		expect(text).toContain('https://github.com/mielsense/evilcharts-sv');
		expect(text).toContain('Original EvilCharts by Gurbinder');
	});

	it('never names the React library the port replaced', () => {
		expect(text.toLowerCase()).not.toContain('recharts');
	});
});

describe('generateLlmsFullTxt', () => {
	const text = generateLlmsFullTxt();

	it('embeds one section per agent page', () => {
		expect(text.startsWith('# EvilCharts Full Documentation')).toBe(true);
		for (const page of getAgentDocPages()) {
			expect(text, page.url).toContain(`Source: ${absoluteUrl(page.url)}`);
		}
	});

	it('inlines registry source rather than leaving preview tags behind', () => {
		expect(text).not.toMatch(/<ComponentPreview/);
		expect(text).not.toMatch(/<ComponentSource/);
		expect(text).toContain('```svelte');
	});
});

describe('generateSkillMd', () => {
	const text = generateSkillMd();

	it('carries the frontmatter an agent-skill loader reads', () => {
		expect(text.startsWith('---\nname: evilcharts')).toBe(true);
		expect(text).toContain(`source: ${absoluteUrl('/llms.txt')}`);
	});

	it('names both install-time providers and the CLI', () => {
		expect(text).toContain('Treat LayerChart and ECharts as separate install-time providers');
		expect(text).toContain('/r/{provider}-{chart-name}.json');
		expect(text).toContain('npx shadcn-svelte@latest add');
		expect(text.toLowerCase()).not.toContain('recharts');
	});

	it('points agents at the maintained Svelte port', () => {
		expect(text).toContain('Svelte 5 port by Mathis');
		expect(text).toContain('https://github.com/mielsense/evilcharts-sv');
	});

	it('ends the project credit lines as complete sentences', () => {
		expect(text).toContain('https://github.com/mielsense/evilcharts-sv.\n');
		expect(text).toContain('https://github.com/legions-developer/evilcharts.\n');
	});

	it('agrees with PROVIDER_META on what is installable', () => {
		for (const id of available) {
			expect(text).toContain(PROVIDER_META[id].name);
		}
		expect(text).toContain(available.length === 1 ? 'is installable' : 'are installable');
	});
});

describe('getAgentSkillsIndex', () => {
	it('advertises one skill against the discovery schema', () => {
		const index = getAgentSkillsIndex();
		expect(index.$schema).toBe('https://schemas.agentskills.io/discovery/0.2.0/schema.json');
		expect(index.skills).toHaveLength(1);
		expect(index.skills[0]).toMatchObject({
			name: 'evilcharts',
			type: 'skill-md',
			url: '/.well-known/agent-skills/evilcharts/SKILL.md'
		});
	});
});
