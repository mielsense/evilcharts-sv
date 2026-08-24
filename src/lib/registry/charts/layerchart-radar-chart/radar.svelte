<script lang="ts">
	/**
	 * A single radar series. Each <Radar /> is fully self-contained: it generates its own
	 * stroke/fill gradients and glow filter under a unique id, so any number of radars — each with
	 * its own variant, opacity, and clickability — can live in one chart without style collisions.
	 * Compose <Dot /> and <ActiveDot /> inside it to add point markers.
	 */
	import { Highlight, Points, Spline, getChartContext } from 'layerchart';
	import { curveLinearClosed } from 'd3-shape';
	import type { Snippet } from 'svelte';
	import { animate, useMotionValue, useReducedMotion } from '@humanspeak/svelte-motion';
	import { ChartDot } from '../../ui/layerchart-dot/index.js';
	import ColorGradient from './defs/color-gradient.svelte';
	import FillGradient from './defs/fill-gradient.svelte';
	import GlowFilter from './defs/glow-filter.svelte';
	import StrokeGradient from './defs/stroke-gradient.svelte';
	import { useRadarChart } from './radar-chart-context.svelte.js';
	import { setRadarSlotsContext } from './radar-slots.svelte.js';
	import { untrack } from 'svelte';
	import {
		DEFAULT_FILL_OPACITY,
		REVEAL_BEGIN,
		REVEAL_DURATION,
		REVEAL_EASE,
		STROKE_WIDTH,
		type RadarVariant
	} from './types.js';

	let {
		dataKey,
		variant = 'filled',
		fillOpacity = DEFAULT_FILL_OPACITY,
		isGlowing = false,
		isClickable = false,
		children,
		radarProps
	}: {
		dataKey: string; // series key — must exist on the data and config
		variant?: RadarVariant; // fill style for this radar only
		fillOpacity?: number; // opacity of the filled area when `variant="filled"`
		isGlowing?: boolean; // adds a soft outer glow around this radar
		isClickable?: boolean; // lets this radar be selected by clicking it
		children?: Snippet; // optional <Dot /> and <ActiveDot /> composition
		radarProps?: Record<string, unknown>; // escape hatch for raw LayerChart Spline props
	} = $props();

	const chart = useRadarChart();
	/** LayerChart's own context, for the plot span the dots' gradient rect needs. */
	const layer = getChartContext();
	const id = $props.id(); // unique id scopes this radar's style defs
	// Devices set to "reduce motion" skip the intro entirely
	const shouldReduceMotion = useReducedMotion();

	/**
	 * The intro, reproducing `<Radar>`'s own animation: every point travels from the centre to its
	 * final position over 1.5s with the CSS `ease` curve. For a polygon centred on the group's
	 * origin that is exactly a uniform scale, so one tween drives the whole shape and its dots.
	 */
	const reveal = useMotionValue(0);

	// `untrack`: `animate` reads the motion value, and a tracked read would re-run this effect
	// on every frame — each run restarting the tween, so it crawled instead of playing once.
	$effect(() => {
		const controls = untrack(() =>
			animate(reveal, 1, {
				delay: REVEAL_BEGIN / 1000,
				duration: REVEAL_DURATION / 1000,
				ease: REVEAL_EASE
			})
		);
		return () => controls.stop();
	});

	const scale = $derived(shouldReduceMotion.current ? 1 : reveal.current);

	/**
	 * The dots' gradient rect, in this group's coordinates.
	 *
	 * `<ChartDot>` defaults to a rect spanning `x=0 → 100%`, which is the plot in a cartesian chart
	 * but starts at the *centre* here — every dot to the left of it vanished. Spanning the plot from
	 * `−width/2` restores the reference's behaviour. See plans/DEVIATIONS.md U-7.
	 */
	const gradientX = $derived(-layer.width / 2);
	const gradientWidth = $derived(layer.width);

	const slots = setRadarSlotsContext();

	const isSelected = $derived(chart.selectedDataKey === null || chart.selectedDataKey === dataKey);
	const isDimmed = $derived(isClickable && !isSelected);

	/**
	 * Opacity when another radar is selected. The stroke stays full (1) on the selected/normal
	 * radar; when dimmed the fill recedes twice as far as the stroke and dots (fill 0.1 vs 0.2) so
	 * the picked radar reads clearly. The fill value multiplies the `fillOpacity` prop;
	 * stroke/dot are absolute.
	 */
	const opacity = $derived({
		stroke: isDimmed ? 0.2 : 1,
		fill: isDimmed ? 0.1 : 1,
		dot: isDimmed ? 0.2 : 1
	});

	const isFilled = $derived(variant === 'filled');

	const dotVariant = $derived(slots.dot?.variant);
	const activeDotVariant = $derived(slots.activeDot?.variant);

	function select() {
		if (!isClickable) return;
		// Clicking the selected radar clears the selection, otherwise selects it
		chart.selectDataKey(chart.selectedDataKey === dataKey ? null : dataKey);
	}
</script>

<!-- The root renders the skeleton radar while loading, so real radars step aside -->
{#if !chart.isLoading}
	{@render children?.()}

	<!-- The intro scales the whole radar out of the centre, which is where this group sits. -->
	<g style={`transform: scale(${scale}); transform-origin: 0 0`}>
		<!--
		One closed path carrying both the fill and the stroke, which is what Recharts' `<Radar>`
		renders. `curveLinearClosed` joins the last vertex back to the first.
	-->
		<Spline
			seriesKey={dataKey}
			curve={curveLinearClosed}
			stroke={`url(#${id}-radar-stroke-${dataKey})`}
			strokeOpacity={opacity.stroke}
			strokeWidth={STROKE_WIDTH}
			fill={isFilled ? `url(#${id}-radar-fill-${dataKey})` : 'none'}
			fillOpacity={isFilled ? fillOpacity * opacity.fill : 0}
			filter={isGlowing ? `url(#${id}-radar-glow-${dataKey})` : undefined}
			class={['transition-opacity duration-200', isClickable && 'cursor-pointer']
				.filter(Boolean)
				.join(' ')}
			onclick={select}
			motion="none"
			{...radarProps}
		/>

		{#if slots.dot}
			<!-- Resting point markers, one per vertex. -->
			<Points seriesKey={dataKey} fill="none" stroke="none">
				{#snippet children({ points })}
					{#each points as point, index (index)}
						<ChartDot
							cx={point.x}
							cy={point.y}
							type={dotVariant}
							{dataKey}
							chartId={id}
							fillOpacity={opacity.dot}
							{gradientX}
							{gradientWidth}
						/>
					{/each}
				{/snippet}
			</Points>
		{/if}

		{#if slots.activeDot}
			<Highlight axis="none">
				{#snippet points({ points })}
					{#each points.filter((p) => (p as { seriesKey?: string }).seriesKey === dataKey) as point, index (index)}
						<ChartDot
							cx={point.x}
							cy={point.y}
							type={activeDotVariant}
							{dataKey}
							chartId={id}
							fillOpacity={opacity.dot}
							{gradientX}
							{gradientWidth}
						/>
					{/each}
				{/snippet}
			</Highlight>
		{/if}
	</g>

	<defs>
		<ColorGradient {id} {dataKey} config={chart.config} />
		<StrokeGradient {id} {dataKey} config={chart.config} />
		{#if isFilled}
			<FillGradient {id} {dataKey} config={chart.config} />
		{/if}
		{#if isGlowing}
			<GlowFilter {id} {dataKey} />
		{/if}
	</defs>
{/if}
