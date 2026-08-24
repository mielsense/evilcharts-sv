<script lang="ts">
	/** Renders the registered `<Legend />` slot as an HTML box outside the plot area. */
	import {
		ChartLegendContent,
		resolveLegendPlacement,
		type LegendPayloadItem,
		type LegendVerticalAlign
	} from '../../ui/layerchart-legend/index.js';
	import { usePieChart } from './pie-chart-context.svelte.js';

	let { placement }: { placement: LegendVerticalAlign } = $props();

	const chart = usePieChart();

	const slot = $derived(chart.slots.legend);
	// Recharts defaults the pie legend to the bottom, unlike the cartesian charts.
	const resolvedPlacement = $derived(resolveLegendPlacement(slot?.verticalAlign, 'bottom'));

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
		class={placement === 'middle'
			? 'pointer-events-auto absolute inset-x-0 top-1/2 z-10 -translate-y-1/2 px-4'
			: undefined}
	/>
{/if}
