<script lang="ts">
	import type { Snippet } from 'svelte';
	import { setEChartsSankeyNodeSlots } from './node-slots.svelte.js';
	import { useEChartsSankeyChart } from './sankey-chart-context.svelte.js';

	let {
		radius = 0,
		isClickable = false,
		children
	}: {
		radius?: number;
		isClickable?: boolean;
		children?: Snippet;
	} = $props();
	const token = $props.id();
	const chart = useEChartsSankeyChart();
	const slots = setEChartsSankeyNodeSlots();
	$effect(() =>
		chart.nodes.register(token, () => ({
			radius,
			isClickable,
			label: slots.labels.first ?? null
		}))
	);
</script>

{@render children?.()}
