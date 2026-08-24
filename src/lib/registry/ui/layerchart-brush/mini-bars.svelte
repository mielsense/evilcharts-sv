<script lang="ts">
	/**
	 * The mini chart's grouped bars.
	 *
	 * A separate component so it can read LayerChart's chart context for the category band size,
	 * which `getBarPositions` needs. The reference pins the mini chart to `barSize={14}` and
	 * `barGap={2}`, so the bars are laid out with Recharts' own arithmetic and applied as insets —
	 * LayerChart's nested band scale cannot reproduce a fixed pixel width.
	 */
	import { Bars, getChartContext } from 'layerchart';
	import { getBarPositions } from '../layerchart-chart/bar-geometry.js';
	import { MINI_BAR_GAP, MINI_BAR_SIZE } from './types.js';

	let {
		keys,
		chartId,
		stacked,
		barCornerRadius
	}: {
		keys: string[];
		chartId: string;
		stacked: boolean;
		barCornerRadius: number;
	} = $props();

	const layer = getChartContext();

	/** With `bandPadding={0}` the band and the step are the same width, as in Recharts. */
	const bandSize = $derived(layer.xScale.bandwidth?.() ?? 0);

	const slots = $derived(
		getBarPositions({
			bandSize,
			// Stacked series share one slot, exactly as a Recharts `stackId` does.
			count: stacked ? 1 : keys.length,
			barGap: MINI_BAR_GAP,
			barSize: MINI_BAR_SIZE
		})
	);

	const bars = $derived(
		keys.map((dataKey, index) => {
			const slot = slots[stacked ? 0 : index];
			return {
				dataKey,
				insets: slot
					? { left: slot.offset, right: Math.max(0, bandSize - slot.offset - slot.size) }
					: undefined
			};
		})
	);
</script>

{#each bars as { dataKey, insets } (dataKey)}
	<Bars
		seriesKey={dataKey}
		fill={`url(#${chartId}-zm-${dataKey})`}
		fillOpacity={0.35}
		radius={barCornerRadius}
		rounded="all"
		{insets}
		motion="none"
	/>
{/each}
