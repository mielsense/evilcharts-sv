/**
 * The agent-facing index, derived from the docs source and `PROVIDER_META` availability.
 *
 * Ported from `evilcharts/src/lib/agent-docs.ts`; the install commands become the
 * shadcn-svelte CLI's and the dependency named in the skill becomes LayerChart.
 */
import {
	DEFAULT_PROVIDER,
	PROVIDERS,
	PROVIDER_META,
	type Provider
} from '$site/globals/constants/providers.js';
import { processMdxForLLMs } from './llm.js';
import { absoluteUrl } from './utils.js';
import { getPages, type DocsPage } from './source.js';

// Pages that belong to no provider: the intro, and the config contract both engines share.
const SHARED_DOCS = new Set(['/docs', '/docs/chart-config']);

// Agent surfaces advertise only what can actually be installed today. A provider whose docs are
// still a placeholder is omitted entirely — listing it would invite agents to recommend components
// that don't exist yet. Flipping `available` in PROVIDER_META is all it takes to publish one.
const AVAILABLE_PROVIDERS = PROVIDERS.filter((id) => PROVIDER_META[id].available);

// The provider skill.md points agents at for setup and examples. Deliberately not
// DEFAULT_PROVIDER — that one drives which engine the docs UI leads with, which may be an engine
// that hasn't shipped yet.
const AGENT_PROVIDER = AVAILABLE_PROVIDERS[0] ?? DEFAULT_PROVIDER;

// No provider has a landing page — `/docs/<provider>` only ever redirects to that engine's
// components overview — so everything real sits beneath the prefix.
function isProviderPage(url: string, provider: Provider) {
	return url.startsWith(`/docs/${provider}/`);
}

/**
 * Derived rather than enumerated: an added chart or provider shows up on its own. The reference's
 * old hard-coded path lists failed silently — a missed entry dropped the page from llms.txt and MCP
 * with nothing to notice it.
 */
function providerPages(pages: DocsPage[], provider: Provider) {
	const prefix = `/docs/${provider}/`;
	const inProvider = pages.filter((page) => isProviderPage(page.url, provider));

	return {
		guides: inProvider.filter((page) =>
			[`${prefix}installation`, `${prefix}components`].includes(page.url)
		),
		// A chart page's URL ends at its folder here, where the reference's kept the `/static`
		// segment, so the pattern anchors at the end rather than requiring a trailing slash.
		charts: inProvider.filter((page) => /\/[a-z]+-chart(\/|$)/.test(page.url)),
		ui: inProvider.filter((page) => page.url.startsWith(`${prefix}ui/`))
	};
}

function getMarkdownUrl(pageUrl: string) {
	return pageUrl === '/docs' ? '/docs.md' : `${pageUrl}.md`;
}

function getPageSummary(page: DocsPage) {
	return {
		title: page.data.title,
		description: page.data.description,
		url: page.url,
		markdownUrl: getMarkdownUrl(page.url)
	};
}

// Absolute URLs on purpose: agents read llms.txt detached from the site, so a relative link gives
// them nothing to resolve against.
function renderLinks(pages: DocsPage[]) {
	return pages
		.map((page) => {
			const summary = getPageSummary(page);
			const description = summary.description ? ` - ${summary.description}` : '';
			return `- [${summary.title}](${absoluteUrl(summary.markdownUrl)})${description}`;
		})
		.join('\n');
}

/**
 * Pages exposed to agents: everything shared, plus every shippable provider's docs. Placeholder
 * providers are filtered out here, so llms-full.txt and the MCP server inherit the same guarantee
 * without repeating the rule.
 */
export function getAgentDocPages(): DocsPage[] {
	return getPages().filter((page) => {
		if (SHARED_DOCS.has(page.url)) return true;
		return AVAILABLE_PROVIDERS.some((id) => isProviderPage(page.url, id));
	});
}

export function generateLlmsTxt() {
	const pages = getAgentDocPages();
	const startHere = pages.filter((page) => SHARED_DOCS.has(page.url));

	const providerSections = AVAILABLE_PROVIDERS.map((id) => {
		const meta = PROVIDER_META[id];
		const { guides, charts, ui } = providerPages(pages, id);

		return `## ${meta.name}

> ${meta.tagline}. Install with \`npx shadcn-svelte@latest add ${absoluteUrl('/r/{component}.json')}\`.

### Setup
${renderLinks(guides)}

### Chart Components
${renderLinks(charts)}

### UI Components
${renderLinks(ui)}`;
	}).join('\n\n');

	return `# EvilCharts Documentation (Svelte port)

> EvilCharts is an open-source chart UI website built with shadcn and LayerChart, beautifully designed and handcrafted.
> This is the unofficial Svelte 5 port of the React original at https://github.com/legions-developer/evilcharts,
> by Gurbinder. MIT-licensed, community-maintained, not affiliated with the original authors.

## Start Here
${renderLinks(startHere)}

${providerSections}

## Agent Resources
- [Full documentation snapshot](${absoluteUrl('/llms-full.txt')})
- [Agent skill](${absoluteUrl('/skill.md')})
- [MCP server](${absoluteUrl('/mcp')})
`;
}

export function generateLlmsFullTxt() {
	const sections = getAgentDocPages().map((page) => {
		const content = processMdxForLLMs(page.body).trim();
		const summary = getPageSummary(page);
		const description = summary.description ? `\n\n> ${summary.description}` : '';

		return `## ${summary.title}${description}

Source: ${absoluteUrl(summary.url)}
Markdown: ${absoluteUrl(summary.markdownUrl)}

${content}`;
	});

	return `# EvilCharts Full Documentation (Svelte port)

> Full markdown snapshot of the EvilCharts documentation generated from the same markdown source as the site.
> This is the unofficial Svelte 5 port of the React original at https://github.com/legions-developer/evilcharts,
> by Gurbinder. MIT-licensed, community-maintained, not affiliated with the original authors.

${sections.join('\n\n---\n\n')}
`;
}

export function generateSkillMd() {
	return `---
name: evilcharts
description: Add and customize EvilCharts chart components in shadcn-svelte and LayerChart projects. Svelte port of legions-developer/evilcharts.
license: MIT
compatibility: Requires a Svelte/SvelteKit project with shadcn-svelte and LayerChart.
metadata:
  source: ${absoluteUrl('/llms.txt')}
---

# EvilCharts (Svelte port)

Use this skill when a user wants to install, add, customize, or debug EvilCharts chart components in
a **Svelte** project. This is the unofficial Svelte 5 port of the React original at
https://github.com/legions-developer/evilcharts by Gurbinder; for a React project, use that instead.

## Workflow

1. Read \`/llms.txt\` to find the relevant documentation page.
2. For setup, follow \`/docs/${AGENT_PROVIDER}/installation.md\`.
3. For chart usage, read the matching chart page such as \`/docs/${AGENT_PROVIDER}/bar-chart.md\`.
4. For shared options, read \`/docs/chart-config.md\`, \`/docs/${AGENT_PROVIDER}/ui/tooltip.md\`, \`/docs/${AGENT_PROVIDER}/ui/legend.md\`, and \`/docs/${AGENT_PROVIDER}/ui/background.md\`.
5. Add components with the shadcn-svelte CLI pattern documented by EvilCharts: \`npx shadcn-svelte@latest add ${absoluteUrl('/r/{chart-name}.json')}\`.

## Constraints

- Do not assume EvilCharts is a separate charting runtime library.
- Treat LayerChart as the underlying chart dependency.
- Docs are grouped by rendering engine under \`/docs/{provider}/\`. Only ${AVAILABLE_PROVIDERS.map(
		(id) => PROVIDER_META[id].name
	).join(' and ')} ${
		AVAILABLE_PROVIDERS.length === 1 ? 'is' : 'are'
	} installable — never suggest components from a provider that is not listed in \`/llms.txt\`.
- \`chartConfig\` is the one contract shared across engines; see \`/docs/chart-config.md\`.
- Preserve the user's existing shadcn-svelte and Tailwind setup.
- This is a Svelte port. For React, point the user at https://github.com/legions-developer/evilcharts.
`;
}

export function getAgentSkillsIndex() {
	return {
		$schema: 'https://schemas.agentskills.io/discovery/0.2.0/schema.json',
		skills: [
			{
				name: 'evilcharts',
				type: 'skill-md',
				description:
					'Add and customize EvilCharts chart components in shadcn-svelte and LayerChart projects.',
				url: '/.well-known/agent-skills/evilcharts/SKILL.md'
			}
		]
	};
}
