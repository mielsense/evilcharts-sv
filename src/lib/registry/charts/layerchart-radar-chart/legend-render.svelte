<script lang="ts">
	/** Renders the registered `<Legend />` slot as an HTML box outside the plot area. */
	import { ChartLegendContent, type LegendPayloadItem } from '../../ui/layerchart-legend/index.js';
	import { useRadarChart } from './radar-chart-context.svelte.js';

	let { placement }: { placement: 'top' | 'bottom' } = $props();

	const chart = useRadarChart();

	const slot = $derived(chart.slots.legend);
	// Recharts defaults the radar legend to the bottom, unlike the cartesian charts.
	const resolvedPlacement = $derived(slot?.verticalAlign === 'top' ? 'top' : 'bottom');

	const payload = $derived<LegendPayloadItem[]>(
		chart.seriesKeys.map((key) => ({ dataKey: key, value: key }))
	);
</script>

{#if slot && !chart.isLoading && resolvedPlacement === placement}
	<ChartLegendContent
		{payload}
		verticalAlign={slot.verticalAlign}
		align={slot.align}
		variant={slot.variant}
		isClickable={slot.isClickable}
		selected={chart.selectedDataKey}
		onSelectChange={chart.selectDataKey}
	/>
{/if}
