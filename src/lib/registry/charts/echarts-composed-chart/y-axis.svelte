<script lang="ts">
	import { useEChartsComposedChart } from './composed-chart-context.svelte.js';
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
	const chart = useEChartsComposedChart();
	$effect(() => chart.yAxes.register(token, () => ({ dataKey, tickFormatter, label, hideDots })));
</script>
