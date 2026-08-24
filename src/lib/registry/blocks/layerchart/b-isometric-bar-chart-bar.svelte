<script lang="ts">
	/**
	 * One isometric column: a front face, a top bevel and a side bevel, hatched over, growing up out
	 * of the baseline on a staggered delay. The tallest column is picked out in the accent colour.
	 *
	 * The reference reads the rectangle from Recharts' shape props; here it comes off the chart
	 * scales with the same arithmetic.
	 */
	import { Bar as LayerBar, getChartContext } from 'layerchart';
	import { useReducedMotion } from '@humanspeak/svelte-motion';
	import { getBarPositions } from '$lib/registry/ui/layerchart-chart/index.js';

	let {
		dataKey,
		rows,
		maxValue,
		idPrefix
	}: {
		dataKey: string;
		rows: Record<string, unknown>[];
		maxValue: number;
		idPrefix: string;
	} = $props();

	const layer = getChartContext();
	const shouldReduceMotion = useReducedMotion();

	const DX = 10;
	const DY = 10;
	const FILLED: boolean = true;
	const DIRECTION = 'right' as 'left' | 'right';
	const HIGHLIGHT_COLOR_DARK = '#15803d';
	/** The reference's `barCategoryGap="25%"`. */
	const BAR_CATEGORY_GAP = '25%';

	const url = (name: string) => `url(#${idPrefix}-${name})`;

	/**
	 * Hoisted out of the template: a fresh object literal on every re-derive makes svelte-motion
	 * tear down and rebuild its presence child, which restarts the intro and leaves it reading a
	 * destroyed branch's derived (`derived_inert`).
	 */
	const INTRO_INITIAL = { transform: 'scaleY(0)', opacity: 0 };
	const INTRO_ANIMATE = { transform: 'scaleY(1)', opacity: 1 };

	/** Memoised per index so the staggered transition keeps its identity when the scales change. */
	const transitions: Record<number, { duration: number; delay: number; ease: number[] }> = {};
	const transitionFor = (index: number) =>
		(transitions[index] ??= { duration: 0.7, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] });

	function growIn(
		transition: { duration: number; delay: number; ease: number[] },
		reduced: boolean
	) {
		return (node: SVGGElement) => {
			if (reduced) return undefined;

			const animation = node.animate([INTRO_INITIAL, INTRO_ANIMATE], {
				duration: transition.duration * 1000,
				delay: transition.delay * 1000,
				easing: `cubic-bezier(${transition.ease.join(',')})`,
				fill: 'both'
			});
			return () => animation.cancel();
		};
	}

	const bars = $derived.by(() => {
		const band = layer.xScale.bandwidth?.() ?? 0;
		const slot = getBarPositions({ bandSize: band, count: 1, barCategoryGap: BAR_CATEGORY_GAP })[0];
		const width = slot?.size ?? band;
		const baseline = Number(layer.yScale(0));

		return rows.map((row, index) => {
			const value = Number(row[dataKey] ?? 0);
			const bx = (Number(layer.xScale(index as never)) || 0) + (slot?.offset ?? 0);
			const by = Number(layer.yScale(value));
			const bh = Math.abs(baseline - by);
			const highlight = value === maxValue;

			const dx = DIRECTION === 'left' ? -DX : DX;
			const sideX = DIRECTION === 'left' ? bx : bx + width;

			return {
				row,
				index,
				bx,
				by,
				bw: width,
				bh,
				highlight,
				transition: transitionFor(index),
				topPoints: `${bx},${by} ${bx + width},${by} ${bx + width + dx},${by - DY} ${bx + dx},${by - DY}`,
				sidePoints: `${sideX},${by} ${sideX + dx},${by - DY} ${sideX + dx},${by + bh - DY} ${sideX},${by + bh}`,
				strokeColor: highlight ? HIGHLIGHT_COLOR_DARK : 'var(--color-accent)',
				frontFill: FILLED ? url(highlight ? 'iso-front-accent' : 'iso-front-base') : 'none',
				topFill: FILLED ? url(highlight ? 'iso-top-accent' : 'iso-top-base') : 'none',
				rightFill: FILLED ? url(highlight ? 'iso-right-accent' : 'iso-right-base') : 'none',
				hatchFill: url(highlight ? 'iso-hatch-accent' : 'iso-hatch-base')
			};
		});
	});
</script>

{#each bars as bar (bar.index)}
	<!-- Transparent twin keeps the column hoverable for the tooltip. -->
	<LayerBar data={bar.row} seriesKey={dataKey} fill="transparent" motion="none" tooltip />

	<!--
		Rendered unconditionally. The reference bails out with `null` when the height is zero, but
		LayerChart runs one pass before it has measured the container, so an `{#if bar.bh > 0}` gate
		tore the group down and rebuilt it — restarting the intro and leaving svelte-motion reading a
		derived from the destroyed branch (`derived_inert`).
	-->
	<g
		{@attach growIn(bar.transition, shouldReduceMotion.current)}
		style:transform-box="fill-box"
		style:transform-origin="50% 100%"
	>
		<polygon
			points={bar.sidePoints}
			fill={bar.rightFill}
			stroke={bar.strokeColor}
			stroke-width={FILLED ? 0 : 1}
		/>
		<polygon
			points={bar.topPoints}
			fill={bar.topFill}
			stroke={bar.strokeColor}
			stroke-width={FILLED ? 0 : 1}
		/>
		<rect
			x={bar.bx}
			y={bar.by}
			width={bar.bw}
			height={bar.bh}
			fill={bar.frontFill}
			stroke={bar.strokeColor}
			stroke-width={FILLED ? 0 : 1}
		/>
		{#if FILLED}
			<rect x={bar.bx} y={bar.by} width={bar.bw} height={bar.bh} fill={bar.hatchFill} />
		{/if}
		{#if FILLED && bar.highlight}
			<rect x={bar.bx} y={bar.by} width={2} height={bar.bh} fill="rgba(0,0,0,0.15)" />
		{/if}
	</g>
{/each}
