<script lang="ts">
	import { useEChartsRadialChart } from './radial-chart-context.svelte.js';
	import { DEFAULT_BAR_SIZE, DEFAULT_CORNER_RADIUS } from './types.js';

	let {
		dataKey,
		cornerRadius = DEFAULT_CORNER_RADIUS,
		barSize = DEFAULT_BAR_SIZE,
		showBackground = true,
		isClickable = false
	}: {
		dataKey: string;
		cornerRadius?: number;
		barSize?: number;
		showBackground?: boolean;
		isClickable?: boolean;
	} = $props();

	const token = $props.id();
	const chart = useEChartsRadialChart();
	$effect(() =>
		chart.radialBars.register(token, () => ({
			dataKey,
			cornerRadius,
			barSize,
			showBackground,
			isClickable
		}))
	);
</script>
