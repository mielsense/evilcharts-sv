<script lang="ts">
	import { useEChartsLineChart } from './line-chart-context.svelte.js';

	let {
		dataKey,
		tickFormatter,
		label,
		hideDots = false
	}: {
		dataKey?: string;
		tickFormatter?: (value: number, index: number) => string;
		label?: string;
		hideDots?: boolean;
	} = $props();
	const token = $props.id();
	const chart = useEChartsLineChart();
	$effect(() =>
		chart.yAxes.register(token, () => ({
			dataKey,
			tickFormatter: tickFormatter as
				((value: string | number, index: number) => string) | undefined,
			label,
			hideDots
		}))
	);
</script>
