/**
 * The agent-facing index, derived from the docs source and `PROVIDER_META` availability.
 *
 * Ported from `evilcharts/src/lib/agent-docs.ts`; the install commands become the
 * shadcn-svelte CLI's and provider-specific installation guidance.
 */
import { PROVIDERS, PROVIDER_META, type Provider } from '$site/globals/constants/providers.js';
import {
	PORT_AUTHOR,
	PORT_REPO_URL,
	PORT_SITE_URL,
	UPSTREAM_AUTHOR,
	UPSTREAM_REPO_URL
} from '$site/globals/constants/site.js';
import { processMdxForLLMs } from './llm.js';
import { absoluteUrl } from './utils.js';
import { getPages, type DocsPage } from './source.js';
import skillSource from '../../../skills/evilcharts-svelte/SKILL.md?raw';
import chartCatalogSource from '../../../skills/evilcharts-svelte/references/chart-catalog.md?raw';
import implementationGuideSource from '../../../skills/evilcharts-svelte/references/implementation-guide.md?raw';

const SKILL_REFERENCES = {
	'chart-catalog.md': chartCatalogSource,
	'implementation-guide.md': implementationGuideSource
} as const;

export type SkillReferenceName = keyof typeof SKILL_REFERENCES;

// Pages that belong to no provider: the intro, and the config contract both engines share.
const SHARED_DOCS = new Set(['/docs', '/docs/chart-config', '/docs/changelog']);

// Agent surfaces advertise only what can actually be installed today. A provider whose docs are
// still a placeholder is omitted entirely — listing it would invite agents to recommend components
// that don't exist yet. Flipping `available` in PROVIDER_META is all it takes to publish one.
const AVAILABLE_PROVIDERS = PROVIDERS.filter((id) => PROVIDER_META[id].available);

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

> ${meta.tagline}. Install with \`npx shadcn-svelte@latest add ${absoluteUrl(`/r/${id}-{chart-name}.json`)}\`.

### Setup
${renderLinks(guides)}

### Chart Components
${renderLinks(charts)}

### UI Components
${renderLinks(ui)}`;
	}).join('\n\n');

	return `# EvilCharts Documentation (Svelte port)

> Svelte 5 port by ${PORT_AUTHOR}: ${PORT_REPO_URL}
> Original EvilCharts by ${UPSTREAM_AUTHOR}: ${UPSTREAM_REPO_URL}
> The port provides LayerChart and Apache ECharts implementations for shadcn-svelte. It is independent from the original project.

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

> Full markdown snapshot generated from the same source as the site.
> Svelte 5 port by ${PORT_AUTHOR}: ${PORT_REPO_URL}
> Original EvilCharts by ${UPSTREAM_AUTHOR}: ${UPSTREAM_REPO_URL}

${sections.join('\n\n---\n\n')}
`;
}

/**
 * The checked-in skill keeps production URLs so GitHub and skills.sh installs stay portable.
 * HTTP routes replace only that origin with this deployment's configured absolute URL.
 */
export function generateSkillMd(origin = absoluteUrl('')) {
	return skillSource.replaceAll(PORT_SITE_URL, origin.replace(/\/$/, ''));
}

export function generateSkillReference(name: SkillReferenceName, origin = absoluteUrl('')) {
	return SKILL_REFERENCES[name].replaceAll(PORT_SITE_URL, origin.replace(/\/$/, ''));
}

export function getAgentSkillsIndex() {
	return {
		$schema: 'https://schemas.agentskills.io/discovery/0.2.0/schema.json',
		skills: [
			{
				name: 'evilcharts-svelte',
				type: 'skill-md',
				description:
					'Add and customize EvilCharts chart components in Svelte projects using LayerChart or ECharts.',
				url: '/.well-known/agent-skills/evilcharts-svelte/SKILL.md'
			}
		]
	};
}

export function getSkillsIndex() {
	const [skill] = getAgentSkillsIndex().skills;

	return {
		skills: [
			{
				name: skill.name,
				description: skill.description,
				files: ['skill.md']
			}
		]
	};
}
