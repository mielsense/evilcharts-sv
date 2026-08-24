<script lang="ts">
	/**
	 * The background grid lines. Defaults to horizontal-only dashed lines and
	 * forwards every LayerChart Grid prop for full control.
	 *
	 * Recharts takes `strokeDasharray` on the grid itself; LayerChart takes the dash pattern on
	 * each axis' line props, so it is threaded into both.
	 */
	import { Grid as LayerGrid } from 'layerchart';
	import { rechartsValueAxisTicks } from '../../ui/layerchart-chart/ticks.js';

	let {
		vertical = false,
		horizontal = true,
		strokeDasharray = '3 3',
		...restProps
	}: {
		vertical?: boolean;
		horizontal?: boolean;
		strokeDasharray?: string;
		[key: string]: unknown;
	} = $props();
</script>

<LayerGrid
	x={vertical ? { dashArray: strokeDasharray } : false}
	y={horizontal ? { dashArray: strokeDasharray } : false}
	yTicks={rechartsValueAxisTicks}
	{...restProps}
/>
