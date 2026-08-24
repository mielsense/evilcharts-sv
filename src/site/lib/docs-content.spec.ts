import { describe, expect, it } from 'vitest';
import { generateLlmsFullTxt } from './agent-docs.js';
import { getPages } from './source.js';

function pageBody(url: string) {
	const page = getPages().find((candidate) => candidate.url === url);
	expect(page, `Missing docs page: ${url}`).toBeDefined();
	return page!.body;
}

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

	it('carries the corrected shared docs into the full agent snapshot', () => {
		const full = generateLlmsFullTxt();

		expect(full).not.toContain('src/registry/ui/background.tsx');
		expect(full).not.toContain('layerchart.github.io');
		expect(full).not.toMatch(/tooltipVariant="[^"]+"\s*\|/);
	});
});
