<script lang="ts">
	import { useEChartsComposedChart } from './composed-chart-context.svelte.js';
	const token = $props.id();
	const chart = useEChartsComposedChart();
	$effect(() => chart.grids.register(token, () => ({})));
</script>
