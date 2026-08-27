<script lang="ts">
	/**
	 * The skeleton area shown while the chart is loading. Rendered by the root in
	 * place of the real areas, paired with its own masked shimmer pattern.
	 */
	import { Area } from 'layerchart';
	import { resolveCurve } from '../../../ui/layerchart-chart/curves.js';
	import { LOADING_AREA_DATA_KEY, type CurveType } from '../types.js';
	import LoadingPattern from './loading-pattern.svelte';

	let { chartId, curveType }: { chartId: string; curveType: CurveType } = $props();
</script>

<!--
	Keep the skeleton geometry fixed while the same shimmer crosses the fill and its top stroke.
-->
<Area
	y={LOADING_AREA_DATA_KEY}
	curve={resolveCurve(curveType)}
	fillOpacity={0.05}
	fill="currentColor"
	motion="none"
	line={{
		stroke: 'currentColor',
		strokeOpacity: 0.5,
		motion: 'none',
		mask: `url(#${chartId}-loading-mask)`
	}}
	mask={`url(#${chartId}-loading-mask)`}
/>
<defs>
	<LoadingPattern {chartId} />
</defs>
