<script lang="ts">
	/** Renders the registered `<Tooltip />` slot: the floating box, as a sibling of `<Svg>`. */
	import { getChartContext } from 'layerchart';
	import {
		ChartTooltip,
		ChartTooltipContent,
		type TooltipPayloadItem
	} from '../../ui/layerchart-tooltip/index.js';
	import { useSankeyChart } from './sankey-chart-context.svelte.js';

	const chart = useSankeyChart();
	/** LayerChart's own context, to tell a hovered node or link from the `defaultIndex` one. */
	const layer = getChartContext();

	const slot = $derived(chart.slots.tooltip);

	/**
	 * Row shown when nothing is hovered — the reference's `defaultIndex`, counted over the nodes.
	 *
	 * The hovered row takes precedence, because LayerChart resolves `dataProp ?? ctx.tooltip.data`
	 * and an unconditional `data` pins the tooltip forever.
	 */
	const defaultRow = $derived.by(() => {
		if (slot?.defaultIndex === undefined) return undefined;
		const node = chart.data.nodes[slot.defaultIndex];
		if (!node) return undefined;
		return { name: node.name, value: nodeValueOf(node.name), payload: node };
	});

	function nodeValueOf(nodeName: string) {
		const index = chart.data.nodes.findIndex((node) => node.name === nodeName);
		if (index === -1) return 0;

		const outgoing = chart.data.links
			.filter((link) => link.source === index)
			.reduce((sum, link) => sum + link.value, 0);
		const incoming = chart.data.links
			.filter((link) => link.target === index)
			.reduce((sum, link) => sum + link.value, 0);

		return outgoing > 0 ? outgoing : incoming;
	}

	/**
	 * One payload entry, matching the reference's `getPayloadOfTooltip`: a node is named by itself,
	 * a link by `"source - target"`.
	 */
	function toPayload(hovered: Record<string, unknown>): TooltipPayloadItem[] {
		return [
			{
				dataKey: 'value',
				name: String(hovered.name ?? ''),
				value: hovered.value as number | string | null,
				payload: hovered.payload ?? hovered
			}
		];
	}
</script>

{#if slot && !chart.isLoading}
	<ChartTooltip data={layer.tooltip.data ?? defaultRow}>
		{#snippet children({ data })}
			<!-- Read inline so changes to the hovered item re-derive the tooltip content. -->
			<ChartTooltipContent
				active
				hideLabel
				nameKey="name"
				payload={toPayload(data as Record<string, unknown>)}
				roundness={slot.roundness}
				variant={slot.variant}
			/>
		{/snippet}
	</ChartTooltip>
{/if}
