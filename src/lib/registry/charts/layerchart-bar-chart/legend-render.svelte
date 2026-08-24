<script lang="ts">
	/** Renders the registered `<Legend />` slot as an HTML box outside the plot area. */
	import { ChartLegendContent, type LegendPayloadItem } from '../../ui/layerchart-legend/index.js';
	import { useBarChart } from './bar-chart-context.svelte.js';

	let { placement }: { placement: 'top' | 'bottom' } = $props();

	const chart = useBarChart();

	const slot = $derived(chart.slots.legend);
	const resolvedPlacement = $derived(
		chart.slots.legend?.verticalAlign === 'bottom' ? 'bottom' : 'top'
	);

	const payload = $derived<LegendPayloadItem[]>(
		chart.seriesKeys.map((key) => ({ dataKey: key, value: key }))
	);
</script>

{#if slot && resolvedPlacement === placement}
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
