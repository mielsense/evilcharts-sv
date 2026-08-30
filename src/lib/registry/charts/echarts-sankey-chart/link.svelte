<script lang="ts">
	import { useEChartsSankeyChart } from './sankey-chart-context.svelte.js';
	import type { LinkVariant } from './types.js';

	let {
		variant = 'gradient',
		verticalPadding = 0
	}: {
		variant?: LinkVariant;
		verticalPadding?: number;
	} = $props();
	const token = $props.id();
	const chart = useEChartsSankeyChart();
	$effect(() => chart.links.register(token, () => ({ variant, verticalPadding })));
</script>
