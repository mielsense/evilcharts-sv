<script lang="ts">
	/** Renders the registered `<Legend />` slot as an HTML box outside the plot area. */
	import { ChartLegendContent, type LegendPayloadItem } from '../../ui/layerchart-legend/index.js';
	import { usePieChart } from './pie-chart-context.svelte.js';

	let { placement }: { placement: 'top' | 'bottom' } = $props();

	const chart = usePieChart();

	const slot = $derived(chart.slots.legend);
	// Recharts defaults the pie legend to the bottom, unlike the cartesian charts.
	const resolvedPlacement = $derived(slot?.verticalAlign === 'top' ? 'top' : 'bottom');

	/** One entry per sector, carrying the row so `nameKey` can resolve its config. */
	const payload = $derived<LegendPayloadItem[]>(
		chart.data.map((row) => ({ value: String(row[chart.nameKey]), payload: row }))
	);
</script>

{#if slot && resolvedPlacement === placement}
	<ChartLegendContent
		{payload}
		nameKey={chart.nameKey}
		verticalAlign={slot.verticalAlign}
		align={slot.align}
		variant={slot.variant}
		isClickable={slot.isClickable}
		selected={chart.selectedSector}
		onSelectChange={chart.selectSector}
	/>
{/if}
