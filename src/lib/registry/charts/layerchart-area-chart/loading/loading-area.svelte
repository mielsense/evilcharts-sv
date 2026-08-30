<script lang="ts">
	/**
	 * The skeleton area shown while the chart is loading. Rendered by the root in
	 * place of the real areas, paired with its own masked shimmer pattern.
	 */
	import { Area, Spline } from 'layerchart';
	import { resolveCurve } from '../../../ui/layerchart-chart/curves.js';
	import { LOADING_AREA_DATA_KEY, STROKE_WIDTH, type CurveType } from '../types.js';
	import LoadingPattern from './loading-pattern.svelte';

	let {
		chartId,
		curveType,
		onShimmerExit
	}: { chartId: string; curveType: CurveType; onShimmerExit: () => void } = $props();
</script>

<!-- Keep the Line-style stroke and the fill beneath it inside one moving shimmer. -->
<g mask={`url(#${chartId}-loading-mask)`}>
	<Area
		y={LOADING_AREA_DATA_KEY}
		curve={resolveCurve(curveType)}
		fillOpacity={0.05}
		fill="currentColor"
		motion="none"
	/>
	<Spline
		y={LOADING_AREA_DATA_KEY}
		curve={resolveCurve(curveType)}
		stroke="currentColor"
		strokeOpacity={0.5}
		strokeWidth={STROKE_WIDTH}
		motion="none"
	/>
</g>
<defs>
	<LoadingPattern {chartId} {onShimmerExit} />
</defs>
