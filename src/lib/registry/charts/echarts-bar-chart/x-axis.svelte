<script lang="ts">
	import { useEChartsBarChart } from './bar-chart-context.svelte.js';
	let {
		dataKey,
		tickFormatter,
		label,
		hideDots = false
	}: {
		dataKey?: string;
		tickFormatter?: (value: string | number, index: number) => string;
		label?: string;
		hideDots?: boolean;
	} = $props();
	const token = $props.id();
	const chart = useEChartsBarChart();
	$effect(() => chart.xAxes.register(token, () => ({ dataKey, tickFormatter, label, hideDots })));
</script>
