<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import ChartContainer from '../layerchart-chart/chart-container.svelte';
	import type { ChartConfig } from '../layerchart-chart/chart-config.js';
	import ChartTooltipContent from './tooltip-content.svelte';

	let {
		config,
		...tooltipProps
	}: { config: ChartConfig } & ComponentProps<typeof ChartTooltipContent> = $props();
</script>

<ChartContainer {config} id="tooltip-harness">
	<ChartTooltipContent {...tooltipProps} />
</ChartContainer>
