<script lang="ts">
	/**
	 * The skeleton line shown while the chart is loading. Rendered by the root in
	 * place of the real lines, paired with its own masked shimmer pattern.
	 */
	import { Spline } from 'layerchart';
	import { resolveCurve } from '../../../ui/layerchart-chart/curves.js';
	import { LOADING_LINE_DATA_KEY, STROKE_WIDTH, type CurveType } from '../types.js';
	import LoadingPattern from './loading-pattern.svelte';

	let {
		chartId,
		curveType,
		onShimmerExit
	}: { chartId: string; curveType: CurveType; onShimmerExit: () => void } = $props();
</script>

<Spline
	y={LOADING_LINE_DATA_KEY}
	curve={resolveCurve(curveType)}
	stroke="currentColor"
	strokeOpacity={0.5}
	strokeWidth={STROKE_WIDTH}
	motion="none"
	mask={`url(#${chartId}-loading-mask)`}
/>
<defs>
	<LoadingPattern {chartId} {onShimmerExit} />
</defs>
