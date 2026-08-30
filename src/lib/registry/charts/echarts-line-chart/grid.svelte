<script lang="ts">
	import { useEChartsLineChart } from './line-chart-context.svelte.js';
	const token = $props.id();
	const chart = useEChartsLineChart();
	$effect(() => chart.grids.register(token, () => ({})));
</script>
