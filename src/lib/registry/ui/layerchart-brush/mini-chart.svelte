<script lang="ts">
	// ─── Mini Chart ─────────────────────────────────────────────────────────────
	import { Area, Chart, Spline, Svg } from 'layerchart';
	import { getColorsCount } from '../layerchart-chart/colors.js';
	import MiniBars from './mini-bars.svelte';
	import { resolveCurve, type CurveType } from '../layerchart-chart/curves.js';
	import type { ChartConfig } from '../layerchart-chart/chart-config.js';
	import type { EvilBrushVariant, StrokeVariant } from './types.js';

	let {
		data,
		keys,
		chartConfig,
		variant,
		curveType,
		chartId,
		stacked,
		strokeVariant = 'solid',
		connectNulls = false,
		barRadius
	}: {
		data: Record<string, unknown>[];
		keys: string[];
		chartConfig: ChartConfig;
		variant: EvilBrushVariant;
		curveType: CurveType;
		chartId: string;
		stacked: boolean;
		strokeVariant?: StrokeVariant;
		connectNulls?: boolean;
		barRadius?: number;
	} = $props();

	const gradients = $derived(
		Object.entries(chartConfig)
			.filter(([key]) => keys.includes(key))
			.map(([dataKey, config]) => ({
				dataKey,
				colorsCount: getColorsCount(config)
			}))
	);

	const dashArray = $derived(
		strokeVariant === 'dashed' || strokeVariant === 'animated-dashed' ? '4 4' : undefined
	);

	const curve = $derived(resolveCurve(curveType));
	const barCornerRadius = $derived(barRadius ?? 3);

	/**
	 * The mini chart is index-based: the reference renders it with no `<XAxis>`, so Recharts
	 * falls back to an implicit category axis over the row indices. LayerChart accessors take
	 * only the datum, so the index is materialised on the row instead.
	 */
	const INDEX_KEY = '__evilBrushIndex';
	const indexedData = $derived(data.map((d, i) => ({ ...d, [INDEX_KEY]: i })));
	const series = $derived(keys.map((key) => ({ key, value: key })));

	function stops(dataKey: string, colorsCount: number) {
		if (colorsCount === 1) {
			return [
				{ offset: '0%', color: `var(--color-${dataKey}-0)` },
				{ offset: '100%', color: `var(--color-${dataKey}-0)` }
			];
		}
		return Array.from({ length: colorsCount }, (_, i) => ({
			offset: `${(i / (colorsCount - 1)) * 100}%`,
			color: `var(--color-${dataKey}-${i}, var(--color-${dataKey}-0))`
		}));
	}

	// `defined` reproduces Recharts' `connectNulls`: when false, gaps break the path.
	const defined = $derived(
		connectNulls
			? undefined
			: (d: Record<string, unknown>, _i: number, key: string) => d[key] != null
	);

	const padding = $derived(
		variant === 'bar'
			? { top: 2, right: 0, bottom: 0, left: 0 }
			: { top: 4, right: 0, bottom: 0, left: 0 }
	);
</script>

{#snippet defsContent()}
	<!-- Vertical fade gradient for area fill mask -->
	{#if variant === 'area'}
		<linearGradient id={`${chartId}-zm-vertical-fade`} x1="0" y1="0" x2="0" y2="1">
			<stop offset="0%" stop-color="white" stop-opacity={0.15} />
			<stop offset="100%" stop-color="white" stop-opacity={0} />
		</linearGradient>
	{/if}
	{#each gradients as { dataKey, colorsCount } (dataKey)}
		<!-- Vertical color gradient (stroke + bar fill) -->
		<linearGradient id={`${chartId}-zm-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
			{#each stops(dataKey, colorsCount) as stop, i (i)}
				<stop offset={stop.offset} stop-color={stop.color} />
			{/each}
		</linearGradient>

		<!-- Area fill: color gradient masked with vertical fade -->
		{#if variant === 'area'}
			<mask id={`${chartId}-zm-fill-mask-${dataKey}`}>
				<rect width="100%" height="100%" fill={`url(#${chartId}-zm-vertical-fade)`} />
			</mask>
			<pattern
				id={`${chartId}-zm-fill-${dataKey}`}
				patternUnits="userSpaceOnUse"
				width="100%"
				height="100%"
			>
				<rect
					width="100%"
					height="100%"
					fill={`url(#${chartId}-zm-${dataKey})`}
					mask={`url(#${chartId}-zm-fill-mask-${dataKey})`}
				/>
			</pattern>
		{/if}
	{/each}
{/snippet}

{#if variant === 'line'}
	<Chart
		data={indexedData}
		x={INDEX_KEY}
		{series}
		seriesLayout="overlap"
		{padding}
		yBaseline={0}
		yNice
		class="h-full w-full"
	>
		<Svg>
			<defs>{@render defsContent()}</defs>
			{#each keys as dk (dk)}
				<Spline
					seriesKey={dk}
					{curve}
					stroke={`url(#${chartId}-zm-${dk})`}
					strokeWidth={1}
					strokeOpacity={0.5}
					stroke-dasharray={dashArray}
					defined={defined ? (d: Record<string, unknown>) => d[dk] != null : undefined}
					motion="none"
				/>
			{/each}
		</Svg>
	</Chart>
{:else if variant === 'bar'}
	<Chart
		data={indexedData}
		x={INDEX_KEY}
		{series}
		seriesLayout={stacked ? 'stack' : 'overlap'}
		{padding}
		yBaseline={0}
		yNice
		bandPadding={0}
		class="h-full w-full"
	>
		<Svg>
			<defs>{@render defsContent()}</defs>
			<MiniBars {keys} {chartId} {stacked} {barCornerRadius} />
		</Svg>
	</Chart>
{:else}
	<Chart
		data={indexedData}
		x={INDEX_KEY}
		{series}
		seriesLayout={stacked ? 'stack' : 'overlap'}
		{padding}
		yBaseline={0}
		yNice
		class="h-full w-full"
	>
		<Svg>
			<defs>{@render defsContent()}</defs>
			{#each keys as dk (dk)}
				<!--
					`stroke="none"` with the stroke moved onto `line`: LayerChart's `<Area stroke>`
					outlines the *closed* path, so it also drew down both sides and along the baseline
					and overhung the brush box, which `overflow-hidden` then clipped. Recharts strokes
					only the top curve. Same split as the main area chart — see plans/DEVIATIONS.md
					A-5.
				-->
				<Area
					seriesKey={dk}
					{curve}
					stroke="none"
					fill={`url(#${chartId}-zm-fill-${dk})`}
					fillOpacity={1}
					line={{
						stroke: `url(#${chartId}-zm-${dk})`,
						strokeWidth: 1,
						strokeOpacity: 0.5,
						'stroke-dasharray': dashArray
					}}
					defined={defined ? (d: Record<string, unknown>) => d[dk] != null : undefined}
					motion="none"
				/>
			{/each}
		</Svg>
	</Chart>
{/if}
