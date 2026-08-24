<script lang="ts">
	/**
	 * The skeleton bar shown while the chart is loading. Rendered by the root in
	 * place of the real bars and lines, paired with its own masked shimmer pattern.
	 */
	import { Bars } from 'layerchart';
	import { LOADING_DATA_KEY } from '../types.js';
	import LoadingPattern from './loading-pattern.svelte';

	let {
		chartId,
		barRadius,
		onShimmerExit
	}: { chartId: string; barRadius: number; onShimmerExit: () => void } = $props();
</script>

<Bars
	seriesKey={LOADING_DATA_KEY}
	fill="currentColor"
	fillOpacity={0.15}
	radius={barRadius}
	rounded="all"
	motion="none"
	mask={`url(#${chartId}-loading-mask)`}
/>
<defs>
	<LoadingPattern {chartId} {onShimmerExit} />
</defs>
