import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { generateLlmsFullTxt } from './agent-docs.js';
import { getPages } from './source.js';

function pageBody(url: string) {
	const page = getPages().find((candidate) => candidate.url === url);
	expect(page, `Missing docs page: ${url}`).toBeDefined();
	return page!.body;
}

const CHART_FAMILIES = [
	'area-chart',
	'line-chart',
	'bar-chart',
	'composed-chart',
	'pie-chart',
	'radar-chart',
	'radial-chart',
	'sankey-chart'
] as const;
const CHART_DOCS = ['layerchart', 'echarts'].flatMap((provider) =>
	CHART_FAMILIES.map((family) => `/docs/${provider}/${family}`)
);

describe('copyable documentation', () => {
	it('publishes provider credits and the per-chart mixing boundary', () => {
		const introduction = pageBody('/docs');

		expect(introduction).toContain('href="https://www.layerchart.com/"');
		expect(introduction).toContain('href="https://echarts.apache.org/"');
		expect(introduction).toContain('per-chart choice');
		expect(introduction).toContain('mix both providers');
		expect(introduction).toContain('must use parts from that same provider');
	});

	it('advertises the portable agent skill separately from Context7 and MCP', () => {
		const introduction = pageBody('/docs');
		const readme = readFileSync('README.md', 'utf8');
		const command = 'npx skills add mielsense/evilcharts-sv --skill evilcharts-svelte';

		for (const content of [introduction, readme]) {
			expect(content).toContain('Install the agent skill');
			expect(content).toContain(command);
		}
	});

	it('resolves every ECharts preview, source panel, and concrete install command', () => {
		const providerPages = getPages().filter((page) => page.url.startsWith('/docs/echarts/'));
		const registry = JSON.parse(readFileSync('registry.json', 'utf8')) as {
			items: Array<{ name: string }>;
		};
		const registryNames = new Set(registry.items.map(({ name }) => name));

		for (const page of providerPages) {
			const references = [
				...page.body.matchAll(/<(?:ComponentPreview|ComponentSource)[^>]*\bname="([^"]+)"/g),
				...page.body.matchAll(/@evilcharts\/([^"\s]+)/g)
			]
				.map((match) => match[1])
				.filter((name) => !name.includes('{'));

			for (const name of references) {
				expect(registryNames, `${page.url} -> ${name}`).toContain(name);
			}
		}
	});

	it('publishes consumer-ready ECharts imports and one manual ECharts dependency', () => {
		for (const page of getPages().filter((candidate) =>
			candidate.url.startsWith('/docs/echarts/')
		)) {
			expect(page.body, page.url).not.toContain('commands={["echarts", "echarts"]}');
			expect(page.body, page.url).not.toMatch(
				/from ["']\$lib\/components\/evilcharts\/(?:charts|ui)\/[^"']+(?<!\/index\.js)["']/
			);
		}
	});

	it('publishes a complete first Chart Config example', () => {
		const firstSvelteFence = pageBody('/docs/chart-config').match(/```svelte\n([\s\S]*?)```/)?.[1];

		expect(firstSvelteFence).toContain('<script lang="ts">');
		expect(firstSvelteFence).toContain('</script>');
		expect(firstSvelteFence).toContain('satisfies ChartConfig');
	});

	it('keeps the background extension recipe on Svelte paths with valid TypeScript', () => {
		const background = pageBody('/docs/layerchart/ui/background');

		expect(background).not.toContain('background.tsx');
		expect(background).not.toMatch(/\/\/ \.\.\.other\nvariants/);
		expect(background).toContain('src/lib/registry/ui/layerchart-background/types.ts');
	});

	it('uses one valid prop value in legend and tooltip examples', () => {
		const legend = pageBody('/docs/layerchart/ui/legend');
		const tooltip = pageBody('/docs/layerchart/ui/tooltip');

		expect(legend).not.toMatch(/legendVariant="[^"]+"\s*\|/);
		expect(tooltip).not.toMatch(/tooltip(?:Roundness|Variant)="[^"]+"\s*\|/);
	});

	it('links to the current LayerChart getting-started guide', () => {
		const installation = pageBody('/docs/layerchart/installation');

		expect(installation).toContain('https://www.layerchart.com/docs');
		expect(installation).not.toContain('layerchart.github.io');
	});

	it('publishes the exact Context7 library ID for coding agents', () => {
		const installation = pageBody('/docs/layerchart/installation');
		const readme = readFileSync('README.md', 'utf8');

		for (const content of [installation, readme]) {
			expect(content).toContain('/mielsense/evilcharts-sv');
			expect(content).toContain('https://context7.com/mielsense/evilcharts-sv');
		}
	});

	it.each(CHART_DOCS)('documents the shared accessibility contract on %s', (url) => {
		const page = pageBody(url);

		expect(page).toContain('<ApiRow name="accessibility" type="ChartAccessibility">');
		expect(page).toContain(
			'It remains a group, so interactive legends and marks stay available to assistive technology.'
		);
	});

	it('publishes accessible chart naming in the agent snapshot', () => {
		const full = generateLlmsFullTxt();
		const accessibilityRows = full.match(/### `accessibility`/g) ?? [];

		expect(full).toContain("label: 'Monthly traffic'");
		expect(full).toMatch(/`labelledBy` and\s+`describedBy`/);
		expect(full).toContain('keeps `role="group"`');
		expect(accessibilityRows).toHaveLength(CHART_DOCS.length);
	});

	it('carries the corrected shared docs into the full agent snapshot', () => {
		const full = generateLlmsFullTxt();

		expect(full).not.toContain('src/registry/ui/background.tsx');
		expect(full).not.toContain('tooltip.tsx');
		expect(full).not.toContain('legend.tsx');
		expect(full).not.toContain('composible');
		expect(full).not.toContain('layerchart.github.io');
		expect(full).not.toMatch(/tooltipVariant="[^"]+"\s*\|/);
	});

	it('links radial and Sankey escape hatches to the LayerChart components they wrap', () => {
		const radial = pageBody('/docs/layerchart/radial-chart');
		const sankey = pageBody('/docs/layerchart/sankey-chart');

		expect(radial).toContain(
			'href="https://www.layerchart.com/docs/components/Chart" _blank>LayerChart Chart documentation'
		);
		expect(radial).toContain(
			'href="https://www.layerchart.com/docs/components/Arc" _blank>LayerChart Arc documentation'
		);
		expect(sankey).toContain(
			'href="https://www.layerchart.com/docs/components/Sankey" _blank>LayerChart Sankey documentation'
		);
	});

	it('publishes the Svelte Sankey type import and composed pie label API', () => {
		const pie = pageBody('/docs/layerchart/pie-chart');
		const sankey = pageBody('/docs/layerchart/sankey-chart');

		expect(sankey).toMatch(
			/import\s*\{[\s\S]*?EvilSankeyChart,[\s\S]*?type SankeyData[\s\S]*?\}\s*from '\$lib\/components\/evilcharts\/charts\/layerchart-sankey-chart\/index\.js';/
		);
		expect(sankey).not.toContain("import type { SankeyData } from 'layerchart';");

		expect(pie).toContain('<EvilPieChart.Label');
		expect(pie).toContain('Use `dataKey` to change the data shown');
		expect(pie).not.toContain('Enable `showLabels`');
		expect(pie).not.toContain('Use `labelKey`');
	});

	it('documents controlled LayerChart selection and the guarded Sankey data contract', () => {
		const area = pageBody('/docs/layerchart/area-chart');
		const pie = pageBody('/docs/layerchart/pie-chart');
		const sankey = pageBody('/docs/layerchart/sankey-chart');

		expect(area).toContain('<ApiRow name="selectedDataKey" type="string | null">');
		expect(area).toContain('pass `null` to clear a controlled selection');
		expect(pie).toContain('<ApiRow name="selectedSector" type="string | null">');
		expect(pie).toContain('pass `null` to clear a controlled selection');
		expect(sankey).toContain('must be an integer index into `nodes`');
		expect(sankey).toContain('The graph must be acyclic');
		expect(sankey).toContain('produces no nodes or links');
	});

	it('records the completed audit work under the dated changelog entry', () => {
		const changelog = pageBody('/docs/changelog');

		expect(changelog).toContain('## 2026-08-30');
		expect(changelog).toContain('installable `evilcharts-svelte` agent skill');
		expect(changelog).toContain('controlled selection to LayerChart Area and Pie roots');
		expect(changelog).toContain('Hardened LayerChart Sankey layout');
		expect(changelog).toContain('bounded non-reflective MCP inputs');
		expect(changelog).not.toContain('## Unreleased');
	});

	it('keeps the README registry inventory in sync with the built registry', () => {
		const readme = readFileSync('README.md', 'utf8');
		const registry = JSON.parse(readFileSync('registry.json', 'utf8')) as {
			items: Array<{
				name: string;
				type: string;
				files: Array<{ path: string }>;
			}>;
		};
		const examples = registry.items.filter(({ name }) => name.startsWith('ex-')).length;
		const blocks = registry.items.filter(
			({ name, type }) => type === 'registry:block' && !name.startsWith('ex-')
		).length;
		const primitives = registry.items.filter(({ files }) =>
			files.some(({ path }) => path.includes('/ui/'))
		).length;

		expect(readme).toContain(`| Documentation examples | ${examples}`);
		expect(readme).toContain(`| Installable blocks     | ${blocks}`);
		expect(readme).toContain(
			`| Shared primitives      | ${primitives} provider-specific UI modules`
		);
		expect(readme).toContain(`| Registry items total   | ${registry.items.length}`);
		expect(readme).toContain('examples/{provider}/     focused `ex-*` documentation demos');
		expect(readme).toContain('ui/                      provider-specific shared primitives');
	});
});
