<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import ChartContainer from '../layerchart-chart/chart-container.svelte';
	import type { ChartConfig } from '../layerchart-chart/chart-config.js';
	import ChartLegendContent from './legend-content.svelte';

	let {
		config,
		...legendProps
	}: { config: ChartConfig } & ComponentProps<typeof ChartLegendContent> = $props();
</script>

<ChartContainer {config} id="legend-harness">
	<ChartLegendContent {...legendProps} />
</ChartContainer>
