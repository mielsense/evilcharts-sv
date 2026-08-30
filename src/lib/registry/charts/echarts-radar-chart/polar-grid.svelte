<script lang="ts">
	import { useEChartsRadarChart } from './radar-chart-context.svelte.js';
	import type { GridType } from './types.js';

	let { gridType = 'polygon' }: { gridType?: GridType } = $props();
	const token = $props.id();
	const chart = useEChartsRadarChart();
	$effect(() => chart.grids.register(token, () => ({ gridType })));
</script>
