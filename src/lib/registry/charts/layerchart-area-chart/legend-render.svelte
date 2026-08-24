<script lang="ts">
	/** Renders the registered `<Legend />` slot as an HTML box outside the plot area. */
	import {
		ChartLegendContent,
		resolveLegendPlacement,
		type LegendPayloadItem,
		type LegendVerticalAlign
	} from '../../ui/layerchart-legend/index.js';
	import { useAreaChart } from './area-chart-context.svelte.js';

	let { placement }: { placement: LegendVerticalAlign } = $props();

	const chart = useAreaChart();

	const slot = $derived(chart.slots.legend);
	const resolvedPlacement = $derived(resolveLegendPlacement(slot?.verticalAlign, 'top'));

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
		class={placement === 'middle'
			? 'pointer-events-auto absolute inset-x-0 top-1/2 z-10 -translate-y-1/2 px-4'
			: undefined}
	/>
{/if}
