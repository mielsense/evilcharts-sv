<script lang="ts">
	/** Renders the registered `<Legend />` slot as an HTML box outside the plot area. */
	import { ChartLegendContent, type LegendPayloadItem } from '../../ui/layerchart-legend/index.js';
	import { useRadialChart } from './radial-chart-context.svelte.js';

	let { placement }: { placement: 'top' | 'bottom' } = $props();

	const chart = useRadialChart();

	const slot = $derived(chart.slots.legend);
	// Recharts defaults the radial legend to the bottom, unlike the cartesian charts.
	const resolvedPlacement = $derived(slot?.verticalAlign === 'top' ? 'top' : 'bottom');

	/**
	 * One entry per bar, carrying the row so `nameKey` can resolve its label and colours.
	 *
	 * `value` is the row's literal `name` property, which is what Recharts' radial legend payload
	 * puts there — *not* the `nameKey` value. That matters because `<Legend itemSorter="value">`
	 * sorts on it: rows without a `name` all compare equal, so the sort is a no-op and the bars keep
	 * data order. Using the `nameKey` value here would sort the legend alphabetically, which is
	 * right for the pie (whose payload really does carry the sector name) but wrong here.
	 * See plans/DEVIATIONS.md A-10.
	 */
	const payload = $derived<LegendPayloadItem[]>(
		chart.data.map((row) => ({ value: row.name as string | undefined, payload: row }))
	);
</script>

{#if slot && !chart.isLoading && resolvedPlacement === placement}
	<ChartLegendContent
		{payload}
		nameKey={chart.nameKey}
		verticalAlign={slot.verticalAlign}
		align={slot.align}
		variant={slot.variant}
		isClickable={slot.isClickable}
		selected={chart.selectedBar}
		onSelectChange={(name) => chart.selectBar(name)}
	/>
{/if}
