import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { generateLlmsFullTxt } from './agent-docs.js';
import { getPages } from './source.js';

function pageBody(url: string) {
	const page = getPages().find((candidate) => candidate.url === url);
	expect(page, `Missing docs page: ${url}`).toBeDefined();
	return page!.body;
}

const CHART_DOCS = [
	'/docs/layerchart/area-chart',
	'/docs/layerchart/line-chart',
	'/docs/layerchart/bar-chart',
	'/docs/layerchart/composed-chart',
	'/docs/layerchart/pie-chart',
	'/docs/layerchart/radar-chart',
	'/docs/layerchart/radial-chart',
	'/docs/layerchart/sankey-chart'
] as const;

describe('copyable documentation', () => {
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

	it('keeps the README registry inventory in sync with the built registry', () => {
		const readme = readFileSync('README.md', 'utf8');
		const registry = JSON.parse(readFileSync('registry.json', 'utf8')) as {
			items: Array<{ name: string }>;
		};
		const examples = registry.items.filter(({ name }) => name.startsWith('ex-')).length;

		expect(readme).toContain(`| Documentation examples | ${examples}`);
		expect(readme).toContain(`| Registry items total   | ${registry.items.length}`);
		expect(readme).toContain(`examples/layerchart/     ${examples} \`ex-*\` documentation demos`);
		expect(readme).toContain('| Shared primitives      | 7:');
		expect(readme).toContain('ui/                      7 shared primitives');
	});
});
