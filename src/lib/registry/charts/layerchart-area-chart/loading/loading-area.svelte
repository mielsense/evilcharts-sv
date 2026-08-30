<script lang="ts">
	/**
	 * The skeleton area shown while the chart is loading. Rendered by the root in
	 * place of the real areas, paired with its own masked shimmer pattern.
	 */
	import { Area, Spline } from 'layerchart';
	import { resolveCurve } from '../../../ui/layerchart-chart/curves.js';
	import { LOADING_AREA_DATA_KEY, STROKE_WIDTH, type CurveType } from '../types.js';
	import LoadingPattern from './loading-pattern.svelte';

	let { chartId, curveType }: { chartId: string; curveType: CurveType } = $props();
</script>

<!-- Keep the geometry fixed while one shimmer crosses both the fill and its top stroke. -->
<Area
	y={LOADING_AREA_DATA_KEY}
	curve={resolveCurve(curveType)}
	fillOpacity={0.05}
	fill="currentColor"
	motion="none"
	mask={`url(#${chartId}-loading-mask)`}
/>
<Spline
	y={LOADING_AREA_DATA_KEY}
	curve={resolveCurve(curveType)}
	stroke="currentColor"
	strokeOpacity={0.5}
	strokeWidth={STROKE_WIDTH}
	motion="none"
	mask={`url(#${chartId}-loading-mask)`}
/>
<defs>
	<LoadingPattern {chartId} />
</defs>
