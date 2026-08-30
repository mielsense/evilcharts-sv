<script lang="ts">
	import { useEChartsPieChart } from './pie-chart-context.svelte.js';
	import type { BackgroundVariant } from './types.js';

	let { variant = 'dots' }: { variant?: BackgroundVariant } = $props();
	const token = $props.id();
	const chart = useEChartsPieChart();
	$effect(() => chart.backgrounds.register(token, () => ({ variant })));
</script>
