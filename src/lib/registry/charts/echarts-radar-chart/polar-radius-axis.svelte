<script lang="ts">
	import { useEChartsRadarChart } from './radar-chart-context.svelte.js';

	const token = $props.id();
	const chart = useEChartsRadarChart();
	$effect(() => chart.radiusAxes.register(token, () => true));
</script>
