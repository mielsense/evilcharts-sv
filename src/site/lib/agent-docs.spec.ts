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
			const shared = url === '/docs' || url === '/docs/chart-config';
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
		}
		expect(text).toContain('### Setup');
		expect(text).toContain('### Chart Components');
		expect(text).toContain('### UI Components');
	});

	it('lists all eight charts and all five UI pages', () => {
		for (const chart of [
			'area-chart',
			'line-chart',
			'bar-chart',
			'composed-chart',
			'radar-chart',
			'pie-chart',
			'radial-chart',
			'sankey-chart'
		]) {
			expect(text, chart).toContain(`/docs/layerchart/${chart}.md`);
		}
		for (const ui of ['background', 'tooltip', 'legend', 'dots', 'brush']) {
			expect(text, ui).toContain(`/docs/layerchart/ui/${ui}.md`);
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

	it('names the substituted dependency and CLI', () => {
		expect(text).toContain('Treat LayerChart as the underlying chart dependency.');
		expect(text).toContain('npx shadcn-svelte@latest add');
		expect(text.toLowerCase()).not.toContain('recharts');
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
