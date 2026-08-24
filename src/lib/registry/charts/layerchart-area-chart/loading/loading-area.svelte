<script lang="ts">
	/**
	 * The skeleton area shown while the chart is loading. Rendered by the root in
	 * place of the real areas, paired with its own masked shimmer pattern.
	 */
	import { Area } from 'layerchart';
	import { resolveCurve } from '../../../ui/layerchart-chart/curves.js';
	import { LOADING_AREA_DATA_KEY, type CurveType } from '../types.js';
	import LoadingPattern from './loading-pattern.svelte';

	let {
		chartId,
		curveType,
		onShimmerExit
	}: { chartId: string; curveType: CurveType; onShimmerExit: () => void } = $props();
</script>

<Area
	y={LOADING_AREA_DATA_KEY}
	curve={resolveCurve(curveType)}
	fillOpacity={0.05}
	fill="currentColor"
	stroke="currentColor"
	strokeOpacity={0.5}
	motion="none"
	line
	mask={`url(#${chartId}-loading-mask)`}
/>
<defs>
	<LoadingPattern {chartId} {onShimmerExit} />
</defs>
