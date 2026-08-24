<script lang="ts">
	/** Renders the registered `<Tooltip />` slot: the floating box, as a sibling of `<Svg>`. */
	import { getChartContext } from 'layerchart';
	import {
		ChartTooltip,
		ChartTooltipContent,
		type TooltipPayloadItem
	} from '../../ui/layerchart-tooltip/index.js';
	import { usePieChart } from './pie-chart-context.svelte.js';

	const chart = usePieChart();
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
	 * See plans/DEVIATIONS.md A-12.
	 */
	const defaultRow = $derived(
		slot?.defaultIndex === undefined ? undefined : chart.data[slot.defaultIndex]
	);

	/**
	 * One payload entry for the hovered sector.
	 *
	 * Recharts hands the pie tooltip a single item whose `name` is the sector name and whose
	 * `payload` is the row, so `nameKey` can resolve the config entry from it.
	 */
	function toPayload(row: Record<string, unknown>): TooltipPayloadItem[] {
		return [
			{
				dataKey: chart.dataKey,
				name: String(row[chart.nameKey]),
				value: row[chart.dataKey] as number | string | null,
				payload: row
			}
		];
	}
</script>

{#if slot && !chart.isLoading}
	<ChartTooltip data={layer.tooltip.data ?? defaultRow}>
		{#snippet children({ data })}
			<!-- Read inline rather than through a `{const}`: a declaration tag in a snippet body does
			     not re-derive when the snippet's argument changes, which froze the tooltip on the
			     first sector it was shown for. See plans/DEVIATIONS.md A-6c. -->
			<ChartTooltipContent
				active
				hideLabel
				payload={toPayload(data as Record<string, unknown>)}
				nameKey={chart.nameKey}
				roundness={slot.roundness}
				variant={slot.variant}
			/>
		{/snippet}
	</ChartTooltip>
{/if}
