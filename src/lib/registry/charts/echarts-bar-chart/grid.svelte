<script lang="ts">
	import { useEChartsBarChart } from './bar-chart-context.svelte.js';
	const token = $props.id();
	const chart = useEChartsBarChart();
	$effect(() => chart.grids.register(token, () => ({})));
</script>
