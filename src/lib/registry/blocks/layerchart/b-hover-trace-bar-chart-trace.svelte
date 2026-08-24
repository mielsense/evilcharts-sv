<script lang="ts">
	/**
	 * The dashed reference line at the tracked value, with its pill label and end dot.
	 *
	 * The reference draws it with Recharts' `<ReferenceLine>` plus a custom label; the y comes from
	 * a spring, so the line eases between values as the pointer moves between columns.
	 */
	import { getChartContext } from 'layerchart';

	let {
		springValue,
		labelValue,
		chartMargin
	}: { springValue: number; labelValue: number; chartMargin: number } = $props();

	const layer = getChartContext();

	const y = $derived(Number(layer.yScale(springValue)));
	const formatted = $derived(labelValue.toLocaleString());
	/** The reference sizes the pill from the label's length. */
	const width = $derived(formatted.length * 8 + 12);
	const xEnd = $derived(Math.max(...layer.xRange));
</script>

<line
	x1={0}
	y1={y}
	x2={xEnd}
	y2={y}
	stroke="var(--foreground)"
	stroke-dasharray="3 3"
	class="pointer-events-none"
/>
<rect
	x={-chartMargin}
	y={y - 9}
	{width}
	height={18}
	fill="var(--foreground)"
	rx={4}
	class="pointer-events-none"
/>
<text
	class="pointer-events-none font-mono text-[11px]"
	font-weight={600}
	x={-chartMargin + 7}
	y={y + 4}
	fill="var(--background)"
>
	{formatted}
</text>
<ellipse cx={xEnd} cy={y} rx={3} ry={3} fill="var(--foreground)" class="pointer-events-none" />
