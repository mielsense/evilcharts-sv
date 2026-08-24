<script lang="ts">
	/**
	 * The background grid lines. Defaults to dashed lines aligned to the value axis based on the
	 * chart layout, and forwards every LayerChart Grid prop for full control.
	 */
	import { Grid as LayerGrid } from 'layerchart';
	import { useBarChart } from './bar-chart-context.svelte.js';

	let {
		vertical,
		horizontal,
		strokeDasharray = '3 3',
		...restProps
	}: {
		vertical?: boolean;
		horizontal?: boolean;
		strokeDasharray?: string;
		[key: string]: unknown;
	} = $props();

	const chart = useBarChart();

	const showVertical = $derived(vertical ?? chart.isHorizontal);
	const showHorizontal = $derived(horizontal ?? !chart.isHorizontal);
</script>

<LayerGrid
	x={showVertical ? { dashArray: strokeDasharray } : false}
	y={showHorizontal ? { dashArray: strokeDasharray } : false}
	{...restProps}
/>
