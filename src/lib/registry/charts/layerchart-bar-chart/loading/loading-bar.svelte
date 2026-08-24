<script lang="ts">
	/**
	 * The skeleton bars shown while the chart is loading. Rendered by the root in
	 * place of the real bars, paired with its own masked shimmer pattern.
	 */
	import { Bars } from 'layerchart';
	import { DEFAULT_BAR_RADIUS, LOADING_BAR_DATA_KEY } from '../types.js';
	import LoadingBarPattern from './loading-bar-pattern.svelte';

	let { chartId, onShimmerExit }: { chartId: string; onShimmerExit: () => void } = $props();
</script>

<Bars
	seriesKey={LOADING_BAR_DATA_KEY}
	fill="currentColor"
	fillOpacity={0.15}
	radius={DEFAULT_BAR_RADIUS}
	rounded="all"
	motion="none"
	mask={`url(#${chartId}-loading-mask)`}
/>
<defs>
	<LoadingBarPattern {chartId} {onShimmerExit} />
</defs>
