<script lang="ts">
	/** Renders the registered `<Tooltip />` slot: the floating box, as a sibling of `<Svg>`. */
	import { getChartContext } from 'layerchart';
	import {
		ChartTooltip,
		ChartTooltipContent,
		type TooltipPayloadItem
	} from '../../ui/layerchart-tooltip/index.js';
	import { useRadarChart } from './radar-chart-context.svelte.js';

	const chart = useRadarChart();
	/** LayerChart's own context, to tell a hovered row from the `defaultIndex` one. */
	const layer = getChartContext();

	const slot = $derived(chart.slots.tooltip);

	/**
	 * Row shown when nothing is hovered — the reference's `defaultIndex`.
	 *
	 * LayerChart resolves its tooltip data as `dataProp ?? ctx.tooltip.data`, so passing `data`
	 * unconditionally pins the tooltip to that row forever: with `defaultIndex` set, hovering any
	 * other category still reported the default one. The hovered row therefore takes precedence
	 * here and `defaultRow` only fills in when nothing is hovered.
	 */
	const defaultRow = $derived(
		slot?.defaultIndex === undefined ? undefined : chart.data[slot.defaultIndex]
	);

	function toPayload(row: Record<string, unknown>): TooltipPayloadItem[] {
		return chart.seriesKeys.map((key) => ({
			dataKey: key,
			name: key,
			value: row[key] as number | string | null,
			payload: row
		}));
	}
</script>

{#if slot && !chart.isLoading}
	<ChartTooltip data={layer.tooltip.data ?? defaultRow}>
		{#snippet children({ data })}
			<!-- Read inline so changes to the hovered row re-derive the tooltip content. -->
			<ChartTooltipContent
				active
				payload={toPayload(data as Record<string, unknown>)}
				label={chart.angleKey
					? ((data as Record<string, unknown>)[chart.angleKey] as string)
					: undefined}
				selected={chart.selectedDataKey}
				roundness={slot.roundness}
				variant={slot.variant}
			/>
		{/snippet}
	</ChartTooltip>
{/if}
