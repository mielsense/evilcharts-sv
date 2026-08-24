/**
 * The four installable blocks.
 *
 * Ported from `evilcharts/src/registry/registry-blocks.ts` — the recharts entries only. Names,
 * descriptions and consumer targets are the reference's; `recharts`/`motion`/`@number-flow/react`
 * become `layerchart`/`@humanspeak/svelte-motion`/`@number-flow/svelte`.
 *
 * Each block is more than one file here: React's `shape` prop takes a component, so the reference
 * can declare its bar shape inline in the same file, while the Svelte port passes the shape as a
 * child component. Those children are listed alongside the block rather than expanded from a
 * directory, because the blocks live flat in `blocks/layerchart/` — that is where
 * `src/lib/registry/components.ts` globs the docs previews from, keyed by file name.
 * See plans/DEVIATIONS.md R-1.
 */
import type { RegistryItem } from './schema.js';

const TARGET_BASE_PATH = '$lib/components/evilcharts/blocks';

/** One `registry:block` file entry per source file, keeping the block's own file names. */
function files(...names: string[]): RegistryItem['files'] {
	return names.map((name) => ({
		path: `blocks/layerchart/${name}.svelte`,
		type: 'registry:block' as const,
		target: `${TARGET_BASE_PATH}/${name.replace(/^b-/, '')}.svelte`
	}));
}

export const blocks: RegistryItem[] = [
	{
		name: 'monospace-bar-chart',
		description: 'Monospace bar chart component',
		dependencies: ['layerchart', '@humanspeak/svelte-motion'],
		registryDependencies: ['@evilcharts/layerchart-chart'],
		type: 'registry:block',
		files: files('b-monospace-bar-chart', 'b-monospace-bar-chart-bar')
	},
	{
		name: 'hover-trace-bar-chart',
		description: 'Bar chart with active value line and animated marker',
		dependencies: ['layerchart', '@humanspeak/svelte-motion', '@number-flow/svelte'],
		registryDependencies: ['@evilcharts/layerchart-chart'],
		type: 'registry:block',
		files: files(
			'b-hover-trace-bar-chart',
			'b-hover-trace-bar-chart-bar',
			'b-hover-trace-bar-chart-trace'
		)
	},
	{
		name: 'grid-bar-chart',
		description: 'Bar chart where each bar is composed of stacked 10x10px squares',
		dependencies: ['layerchart'],
		registryDependencies: ['@evilcharts/layerchart-chart'],
		type: 'registry:block',
		files: files('b-grid-bar-chart', 'b-grid-bar-chart-bar')
	},
	{
		name: 'isometric-bar-chart',
		description: 'Bar chart with isometric 3D-extruded bars and a highlighted max value',
		dependencies: ['layerchart', '@humanspeak/svelte-motion'],
		registryDependencies: ['@evilcharts/layerchart-chart'],
		type: 'registry:block',
		files: files('b-isometric-bar-chart', 'b-isometric-bar-chart-bar', 'b-isometric-bar-chart-defs')
	}
];
