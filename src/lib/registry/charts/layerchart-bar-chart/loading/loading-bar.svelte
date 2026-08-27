<script lang="ts">
	/**
	 * The skeleton bars shown while the chart is loading. Rendered by the root in
	 * place of the real bars, paired with its own masked shimmer pattern.
	 */
	import { Bars, getChartContext } from 'layerchart';
	import { getBarPositions } from '../../../ui/layerchart-chart/bar-geometry.js';
	import { useBarChart } from '../bar-chart-context.svelte.js';
	import { DEFAULT_BAR_RADIUS, LOADING_BAR_DATA_KEY } from '../types.js';
	import LoadingBarPattern from './loading-bar-pattern.svelte';

	let { chartId, onShimmerExit }: { chartId: string; onShimmerExit: () => void } = $props();

	const chart = useBarChart();
	const layer = getChartContext();
	const bandSize = $derived(
		chart.isHorizontal
			? ((layer.yScale as { bandwidth?: () => number }).bandwidth?.() ?? 0)
			: ((layer.xScale as { bandwidth?: () => number }).bandwidth?.() ?? 0)
	);
	const slot = $derived(getBarPositions({ bandSize, count: 1 })[0]);
	const insets = $derived(
		chart.isHorizontal
			? { top: slot?.offset ?? 0, bottom: bandSize - (slot?.offset ?? 0) - (slot?.size ?? 0) }
			: { left: slot?.offset ?? 0, right: bandSize - (slot?.offset ?? 0) - (slot?.size ?? 0) }
	);
</script>

<Bars
	seriesKey={LOADING_BAR_DATA_KEY}
	fill="currentColor"
	fillOpacity={0.15}
	radius={DEFAULT_BAR_RADIUS}
	rounded="all"
	{insets}
	motion="none"
	mask={`url(#${chartId}-loading-mask)`}
/>
<defs>
	<LoadingBarPattern {chartId} {onShimmerExit} />
</defs>
