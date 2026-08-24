<script lang="ts">
	/** Renders the registered `<Tooltip />` slot: the floating box, as a sibling of `<Svg>`. */
	import { getChartContext } from 'layerchart';
	import {
		ChartTooltip,
		ChartTooltipContent,
		type TooltipPayloadItem
	} from '../../ui/layerchart-tooltip/index.js';
	import { useRadialChart } from './radial-chart-context.svelte.js';

	const chart = useRadialChart();
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
	 * One payload entry for the hovered bar.
	 *
	 * Recharts hands the radial tooltip a single item whose `name` is the bar name and whose
	 * `payload` is the row, so `nameKey` can resolve the config entry from it.
	 */
	function toPayload(row: Record<string, unknown>): TooltipPayloadItem[] {
		const valueKey = chart.valueKey;

		return [
			{
				dataKey: valueKey,
				name: String(row[chart.nameKey]),
				value: valueKey ? (row[valueKey] as number | string | null) : null,
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
