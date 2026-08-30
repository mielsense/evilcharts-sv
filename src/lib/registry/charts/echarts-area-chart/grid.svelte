<script lang="ts">
	import { useEChartsAreaChart } from './area-chart-context.svelte.js';
	const token = $props.id();
	const chart = useEChartsAreaChart();
	$effect(() => chart.grids.register(token, () => ({})));
</script>
