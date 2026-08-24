<script lang="ts">
	/**
	 * Renders the registered `<Tooltip cursor>` slot: the dashed vertical rule that follows the
	 * pointer. Lives inside `<Svg>`, matching Recharts' tooltip cursor.
	 */
	import { Highlight, getChartContext } from 'layerchart';
	import { useLineChart } from './line-chart-context.svelte.js';
	import { STROKE_WIDTH } from './types.js';

	const chart = useLineChart();
	/** LayerChart's own context, to tell a hovered row from the `defaultIndex` one. */
	const layer = getChartContext();

	const slot = $derived(chart.slots.tooltip);
	const defaultRow = $derived(
		slot?.defaultIndex === undefined ? undefined : chart.data[slot.defaultIndex]
	);
	// The hovered row wins over `defaultIndex`, for the same reason as the tooltip box
	// (DEVIATIONS A-12).
	const cursorRow = $derived(layer.tooltip.data ?? defaultRow);
</script>

{#if slot?.cursor && !chart.isLoading}
	<Highlight axis="x" lines={{ dashArray: '3 3', strokeWidth: STROKE_WIDTH }} data={cursorRow} />
{/if}
