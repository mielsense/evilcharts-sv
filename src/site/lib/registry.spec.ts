import { describe, expect, it } from 'vitest';
import {
	createFileTree,
	fixImports,
	getRegistryItem,
	getRegistryItemSourceFile,
	getRegistryItemSourceMeta
} from './registry.js';

describe('fixImports', () => {
	it.each([
		[
			"import { EvilBarChart } from '$lib/registry/charts/layerchart-bar-chart/index.js';",
			"import { EvilBarChart } from '$lib/components/evilcharts/charts/layerchart-bar-chart/index.js';"
		],
		[
			"import { ChartContainer } from '$lib/registry/ui/layerchart-chart/index.js';",
			"import { ChartContainer } from '$lib/components/evilcharts/ui/layerchart-chart/index.js';"
		],
		[
			"import Bar from '$lib/registry/blocks/layerchart/b-grid-bar-chart-bar.svelte';",
			"import Bar from '$lib/components/evilcharts/blocks/layerchart/b-grid-bar-chart-bar.svelte';"
		],
		[
			"import { EChartsAreaChart } from '../../charts/echarts-area-chart/index.js';",
			"import { EChartsAreaChart } from '$lib/components/evilcharts/charts/echarts-area-chart/index.js';"
		],
		[
			"import type { ChartConfig } from '../../ui/echarts-chart/index.js';",
			"import type { ChartConfig } from '$lib/components/evilcharts/ui/echarts-chart/index.js';"
		],
		[
			"import Shape from './b-grid-echarts-bar-chart-shape.svelte';",
			"import Shape from './grid-echarts-bar-chart-shape.svelte';"
		]
	])('rewrites %s', (input, expected) => {
		expect(fixImports(input)).toBe(expected);
	});

	it.each([
		"import { cn } from '$lib/utils.js';",
		"import { Chart } from 'layerchart';",
		"import { motion } from '@humanspeak/svelte-motion';"
	])('leaves %s alone', (line) => {
		expect(fixImports(line)).toBe(line);
	});
});

describe('getRegistryItem', () => {
	it('returns null for an unknown name', async () => {
		expect(await getRegistryItem('ex-nope')).toBeNull();
	});

	it('reads an example and rewrites its imports', async () => {
		const item = await getRegistryItem('ex-bar-chart');
		expect(item?.files).toHaveLength(1);
		expect(item?.files[0].path).toBe('ex-bar-chart.svelte');
		expect(item?.files[0].content).toContain('$lib/components/evilcharts/charts/');
		expect(item?.files[0].content).not.toContain('$lib/registry/');
	});

	it('reads an ECharts block with consumer-ready cross-item imports', async () => {
		const item = await getRegistryItem('audience-echarts-area-chart');
		expect(item?.files[0].content).toContain(
			"from '$lib/components/evilcharts/charts/echarts-area-chart/index.js'"
		);
		expect(item?.files[0].content).not.toContain("from '../../charts/");
	});

	it('reads a whole chart directory, with paths relative to it', async () => {
		const item = await getRegistryItem('layerchart-bar-chart');
		expect(item!.files.length).toBeGreaterThan(5);
		for (const file of item!.files) {
			expect(file.path).not.toContain('src/lib/registry');
			expect(file.path).not.toMatch(/\.(spec|e2e)\./);
		}
		expect(item!.files.map((f) => f.path)).toContain('bar.svelte');
		// Nested `defs/` files keep their subdirectory.
		expect(item!.files.some((f) => f.path.startsWith('defs/'))).toBe(true);
	});

	it('keeps component files ahead of support types in metadata and indexed payloads', async () => {
		const metadata = getRegistryItemSourceMeta('layerchart-chart');
		expect(metadata?.files[0].path).toBe('animated-grow.svelte');

		const firstFile = await getRegistryItemSourceFile('layerchart-chart', 0);
		expect(firstFile?.path).toBe('animated-grow.svelte');
	});
});

describe('createFileTree', () => {
	it('nests files under their target directories', () => {
		const tree = createFileTree([
			{ path: 'bar.svelte', target: '$lib/components/evilcharts/charts/x/bar.svelte' },
			{ path: 'defs/glow.svelte', target: '$lib/components/evilcharts/charts/x/defs/glow.svelte' }
		]);

		expect(tree).toEqual([
			{
				name: '$lib',
				children: [
					{
						name: 'components',
						children: [
							{
								name: 'evilcharts',
								children: [
									{
										name: 'charts',
										children: [
											{
												name: 'x',
												children: [
													{
														name: 'bar.svelte',
														path: '$lib/components/evilcharts/charts/x/bar.svelte'
													},
													{
														name: 'defs',
														children: [
															{
																name: 'glow.svelte',
																path: '$lib/components/evilcharts/charts/x/defs/glow.svelte'
															}
														]
													}
												]
											}
										]
									}
								]
							}
						]
					}
				]
			}
		]);
	});

	it('falls back to the source path when an item declares no target', () => {
		const tree = createFileTree([{ path: 'ex-bar-chart.svelte' }]);
		expect(tree).toEqual([{ name: 'ex-bar-chart.svelte', path: 'ex-bar-chart.svelte' }]);
	});
});
