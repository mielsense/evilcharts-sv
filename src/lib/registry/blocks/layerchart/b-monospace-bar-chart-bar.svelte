<script lang="ts">
	/**
	 * One monospace bar per row.
	 *
	 * Resting, a bar is a thin line (`COLLAPSED_SCALE`); hovered, it springs out to full width and
	 * its value floats in above it. The reference gets `isActive` from Recharts' `activeBar`, which
	 * here is the row LayerChart's tooltip is pointing at.
	 *
	 * `transform-box: fill-box` with motion's default origin collapses each bar onto its **own**
	 * centre. The reference also computes an absolute `transformOrigin`, but motion overrides it —
	 * measured on the reference, every bar resolves to `width/2 height/2`. Passing the absolute
	 * value here instead pushed the origin outside the 19px rect and the bars vanished.
	 *
	 * No `<AnimatePresence>`: this port's version renders a wrapper `<div>`, which is invalid inside
	 * an `<svg>` and left every rect with a 0x0 box. React's renders no DOM at all. It is not needed
	 * anyway — the rect never unmounts, and the value label animates its opacity instead of
	 * mounting and unmounting, which is what the reference's enter/exit pair looks like.
	 */
	import { Bar as LayerBar, getChartContext } from 'layerchart';
	import { animate, useReducedMotion } from '@humanspeak/svelte-motion';
	import { getBarPositions } from '$lib/registry/ui/layerchart-chart/index.js';

	let {
		dataKey,
		rows,
		activeRow,
		fill
	}: {
		dataKey: string;
		rows: Record<string, unknown>[];
		activeRow: Record<string, unknown> | undefined;
		fill: string;
	} = $props();

	const layer = getChartContext();
	const shouldReduceMotion = useReducedMotion();

	// Scale factor: collapsed = thin line, expanded = full width
	const COLLAPSED_SCALE = 0.1;

	function animateScaleX(target: number, reduced: boolean) {
		return (node: SVGRectElement) => {
			node.style.transformBox = 'fill-box';
			node.style.transformOrigin = 'center';

			if (reduced) {
				node.style.transform = `scaleX(${target})`;
				return undefined;
			}

			const controls = animate(
				node,
				{ scaleX: target },
				{
					type: 'spring',
					stiffness: 200,
					damping: 25
				}
			);

			return () => controls.stop();
		};
	}

	/**
	 * Geometry per row, read off the chart scales — the reference gets it from Recharts' shape
	 * props. Resolved in one derivation rather than with declaration tags.
	 */
	const bars = $derived.by(() => {
		const band = layer.xScale.bandwidth?.() ?? 0;
		// One bar per category, sized by Recharts' own arithmetic — a 24.5px band yields a 19px bar
		// with `barCategoryGap="10%"`, which is what the reference renders.
		const slot = getBarPositions({ bandSize: band, count: 1 })[0];

		return rows.map((row, index) => {
			const value = Number(row[dataKey] ?? 0);
			const x = (Number(layer.xScale(index as never)) || 0) + (slot?.offset ?? 0);
			const y = Number(layer.yScale(value));
			const height = Math.abs(Number(layer.yScale(0)) - y);

			return {
				row,
				index,
				value,
				x,
				y,
				width: slot?.size ?? band,
				height,
				centerX: x + (slot?.size ?? band) / 2,
				isActive: activeRow === row
			};
		});
	});
</script>

{#each bars as bar (bar.index)}
	<!-- Transparent twin keeps the whole column hoverable while the painted bar is collapsed. -->
	<LayerBar data={bar.row} seriesKey={dataKey} fill="transparent" motion="none" tooltip />

	<rect
		{@attach animateScaleX(bar.isActive ? 1 : COLLAPSED_SCALE, shouldReduceMotion.current)}
		class="origin-center"
		x={bar.x}
		y={bar.y}
		width={bar.width}
		height={bar.height}
		{fill}
	/>
	<text
		class="pointer-events-none font-mono transition-[opacity,transform,filter] duration-200 motion-reduce:transition-none"
		style:opacity={bar.isActive ? 1 : 0}
		style:transform={`translateY(${bar.isActive ? 0 : -10}px)`}
		style:filter={bar.isActive ? 'blur(0px)' : 'blur(3px)'}
		x={bar.centerX}
		y={bar.y - 5}
		text-anchor="middle"
		{fill}
	>
		{bar.value}
	</text>
{/each}
