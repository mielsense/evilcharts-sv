<script lang="ts">
	/**
	 * One hover-trace column: dimmed unless it is the highlighted one, and outlined while hovered.
	 *
	 * The reference reads `isActive` from Recharts' `activeBar` and `highlightedIndex` from the
	 * chart's own state; both come from the chart context here.
	 */
	import { Bar as LayerBar, getChartContext } from 'layerchart';
	import { getBarPositions } from '$lib/registry/ui/layerchart-chart/index.js';

	let {
		dataKey,
		rows,
		activeRow,
		highlightedIndex,
		fill
	}: {
		dataKey: string;
		rows: Record<string, unknown>[];
		activeRow: Record<string, unknown> | undefined;
		highlightedIndex: number;
		fill: string;
	} = $props();

	const layer = getChartContext();

	/**
	 * Column width and offset from Recharts' own arithmetic — its default `barCategoryGap="10%"`
	 * leaves a gap either side, which `bandPadding={0}` alone would not (PITFALLS §3).
	 */
	const insets = $derived.by(() => {
		const band = layer.xScale.bandwidth?.() ?? 0;
		const slot = getBarPositions({ bandSize: band, count: 1 })[0];
		if (!slot) return {};
		return { left: slot.offset, right: Math.max(0, band - slot.offset - slot.size) };
	});

	const bars = $derived(
		rows.map((row, index) => {
			const isActive = activeRow === row;
			return {
				row,
				index,
				isActive,
				// Everything but the highlighted (or hovered) column recedes.
				fillOpacity: isActive || index === highlightedIndex ? 1 : 0.2
			};
		})
	);
</script>

{#each bars as bar (bar.index)}
	<!-- Transparent twin: a full-height hit area, as the reference's first `<Rectangle>` is. -->
	<LayerBar
		data={bar.row}
		seriesKey={dataKey}
		fill="transparent"
		motion="none"
		tooltip
		style="pointer-events: all"
	/>
	<LayerBar
		data={bar.row}
		seriesKey={dataKey}
		radius={4}
		rounded="all"
		{insets}
		{fill}
		fillOpacity={bar.fillOpacity}
		stroke={bar.isActive ? 'var(--foreground)' : undefined}
		strokeOpacity={bar.isActive ? 0.35 : undefined}
		strokeWidth={bar.isActive ? 1 : undefined}
		class="transition-opacity duration-200"
		motion="none"
	/>
{/each}
