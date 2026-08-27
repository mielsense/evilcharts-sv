<script lang="ts">
	/**
	 * The skeleton bar shown while the chart is loading. Rendered by the root in
	 * place of the real bars and lines, paired with its own masked shimmer pattern.
	 */
	import { Bars, getChartContext } from 'layerchart';
	import { getBarPositions } from '../../../ui/layerchart-chart/bar-geometry.js';
	import { LOADING_DATA_KEY } from '../types.js';
	import LoadingPattern from './loading-pattern.svelte';

	let {
		chartId,
		barRadius,
		onShimmerExit
	}: { chartId: string; barRadius: number; onShimmerExit: () => void } = $props();

	const layer = getChartContext();
	const bandSize = $derived((layer.xScale as { bandwidth?: () => number }).bandwidth?.() ?? 0);
	const slot = $derived(getBarPositions({ bandSize, count: 1 })[0]);
	const insets = $derived({
		left: slot?.offset ?? 0,
		right: bandSize - (slot?.offset ?? 0) - (slot?.size ?? 0)
	});
</script>

<Bars
	seriesKey={LOADING_DATA_KEY}
	fill="currentColor"
	fillOpacity={0.15}
	radius={barRadius}
	rounded="all"
	{insets}
	motion="none"
	mask={`url(#${chartId}-loading-mask)`}
/>
<defs>
	<LoadingPattern {chartId} {onShimmerExit} />
</defs>
