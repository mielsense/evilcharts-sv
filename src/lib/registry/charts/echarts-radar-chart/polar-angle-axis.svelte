<script lang="ts">
	import { useEChartsRadarChart } from './radar-chart-context.svelte.js';

	let { dataKey }: { dataKey?: string } = $props();
	const token = $props.id();
	const chart = useEChartsRadarChart();
	$effect(() => chart.angleAxes.register(token, () => ({ dataKey })));
</script>
