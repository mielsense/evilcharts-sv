<script lang="ts">
	/**
	 * A single line series. Each <Line /> is fully self-contained: it generates its
	 * own color gradient and glow filter under a unique id, so any number of lines —
	 * each with its own stroke, curve, glow, and clickability — can live in one chart
	 * without style collisions. Compose <Dot /> and <ActiveDot /> inside it to add
	 * point markers.
	 */
	import { Highlight, Points, Spline } from 'layerchart';
	import { useReducedMotion } from '@humanspeak/svelte-motion';
	import type { Snippet } from 'svelte';
	import { resolveCurve } from '../../ui/layerchart-chart/curves.js';
	import { ChartDot } from '../../ui/layerchart-dot/index.js';
	import type { DitherVariant } from '../../ui/layerchart-dither/index.js';
	import { useComposedChart } from './composed-chart-context.svelte.js';
	import HorizontalColorGradient from './defs/horizontal-color-gradient.svelte';
	import LineGlowFilter from './defs/line-glow-filter.svelte';
	import RevealMask from './defs/reveal-mask.svelte';
	import { getOpacity } from './helpers.js';
	import { setLineSlotsContext } from './line-slots.svelte.js';
	import {
		STROKE_WIDTH,
		type ComposedAnimationType,
		type CurveType,
		type StrokeVariant
	} from './types.js';

	let {
		dataKey,
		strokeVariant = 'solid',
		curveType,
		animationType,
		connectNulls = false,
		glow = false,
		isClickable = false,
		children,
		lineProps,
		ditherVariant
	}: {
		dataKey: string; // series key — must exist on the data and config
		strokeVariant?: StrokeVariant; // stroke style for this line only
		curveType?: CurveType; // curve interpolation — falls back to the chart default
		animationType?: ComposedAnimationType; // intro reveal — falls back to the chart default
		connectNulls?: boolean; // join segments across null/missing values
		glow?: boolean; // applies a soft neon glow to this line
		isClickable?: boolean; // lets this line be selected by clicking it
		children?: Snippet; // optional <Dot /> and <ActiveDot /> composition
		lineProps?: Record<string, unknown>; // escape hatch for raw LayerChart Spline props
		ditherVariant?: DitherVariant; // ordered-dither texture override
	} = $props();

	const chart = useComposedChart();
	const id = $props.id(); // unique id scopes this line's style defs
	// Devices set to "reduce motion" skip the intro reveal entirely
	const shouldReduceMotion = useReducedMotion();

	const slots = setLineSlotsContext();

	const resolvedCurve = $derived(curveType ?? chart.curveType);

	// The reveal is an animated SVG mask — heavier than a static chart — so
	// `"none"` and the OS reduce-motion preference both opt out of it.
	const revealType = $derived<ComposedAnimationType>(
		shouldReduceMotion.current ? 'none' : (animationType ?? chart.animationType)
	);
	const maskId = $derived(revealType === 'none' ? undefined : `${id}-reveal-mask`);

	const opacity = $derived(getOpacity(chart.selectedDataKey, dataKey));
	const hasSelection = $derived(chart.selectedDataKey !== null);
	const filter = $derived(glow ? `url(#${id}-glow)` : undefined);

	const dotVariant = $derived(slots.dot?.variant);
	const activeDotVariant = $derived(slots.activeDot?.variant);

	const isAnimatedDashed = $derived(strokeVariant === 'animated-dashed');
	const isDashed = $derived(strokeVariant === 'dashed' || isAnimatedDashed);
	const isDither = $derived(chart.renderStyle === 'dither' && !isAnimatedDashed);
	const resolvedDitherVariant = $derived(ditherVariant ?? chart.ditherVariant);

	const defined = $derived(
		connectNulls
			? undefined
			: (d: Record<string, unknown>) => d[dataKey] !== null && d[dataKey] !== undefined
	);

	function select() {
		if (!isClickable) return;
		// Clicking the selected line clears the selection, otherwise selects it
		chart.selectDataKey(chart.selectedDataKey === dataKey ? null : dataKey);
	}

	/**
	 * Centres a point on the *category* band.
	 *
	 * `<Points seriesKey>` normally centres on the sub-band when one exists, which is right for a
	 * grouped bar but wrong for a line — Recharts always plots a line through the category centre.
	 * Passing the offset explicitly keeps the dots on the stroke once two bars have split the band.
	 */
	const bandOffset = (_value: number, ctx: { xScale: { bandwidth?: () => number } }) =>
		(ctx.xScale.bandwidth?.() ?? 0) / 2;
</script>

<!-- The root renders the skeleton bar while loading, so real lines step aside -->
{#if !chart.isLoading}
	{@render children?.()}

	{#if isClickable}
		<!-- Invisible fat stroke: a 20px hit area so the thin line is easy to click -->
		<Spline
			seriesKey={dataKey}
			curve={resolveCurve(resolvedCurve)}
			stroke="transparent"
			strokeWidth={20}
			{defined}
			motion="none"
			class="cursor-pointer"
			onclick={select}
		/>
	{/if}
	<Spline
		seriesKey={dataKey}
		curve={resolveCurve(resolvedCurve)}
		strokeOpacity={opacity.stroke}
		stroke={isDither ? 'transparent' : `url(#${id}-line-colors-${dataKey})`}
		strokeWidth={STROKE_WIDTH}
		stroke-dasharray={isDashed ? '5 5' : undefined}
		{filter}
		{defined}
		mask={maskId ? `url(#${maskId})` : undefined}
		data-evil-dither-mark={isDither ? 'stroke' : undefined}
		data-evil-dither-key={isDither ? dataKey : undefined}
		data-evil-dither-variant={isDither ? resolvedDitherVariant : undefined}
		data-evil-dither-reveal={isDither ? revealType : undefined}
		data-evil-dither-glow={isDither && glow ? 'true' : undefined}
		class={[
			isClickable && 'pointer-events-none cursor-pointer',
			isAnimatedDashed && !hasSelection && 'evil-composed-animated-dash'
		]
			.filter(Boolean)
			.join(' ') || undefined}
		motion="none"
		{...lineProps}
	/>

	{#if slots.dot}
		<!-- Resting point markers, wired to the intro reveal so they wipe in with the line -->
		<Points seriesKey={dataKey} offsetX={bandOffset} fill="none" stroke="none">
			{#snippet children({ points })}
				{#each points as point, index (index)}
					<ChartDot
						cx={point.x}
						cy={point.y}
						type={dotVariant}
						{dataKey}
						chartId={`${id}-line`}
						fillOpacity={opacity.dot}
						{maskId}
					/>
				{/each}
			{/snippet}
		</Points>
	{/if}

	{#if slots.activeDot}
		<!-- The active dot is left unmasked: it only appears on hover, after the intro -->
		<Highlight axis="none">
			{#snippet points({ points })}
				{#each points.filter((p) => (p as { seriesKey?: string }).seriesKey === dataKey) as point, index (index)}
					<ChartDot
						cx={point.x}
						cy={point.y}
						type={activeDotVariant}
						{dataKey}
						chartId={`${id}-line`}
						fillOpacity={opacity.dot}
					/>
				{/each}
			{/snippet}
		</Highlight>
	{/if}

	<defs>
		{#if revealType !== 'none'}
			<RevealMask {id} type={revealType} introStartedAt={chart.introStartedAt} />
		{/if}
		<HorizontalColorGradient {id} {dataKey} config={chart.config} />
		{#if glow}
			<LineGlowFilter {id} />
		{/if}
	</defs>
{/if}

<style>
	/*
		Move a fixed dash pattern along the stroke. Animating the dash lengths makes the visible dash
		shrink to zero every half-cycle, which reads as a flicker instead of directional motion.
	*/
	@keyframes evil-composed-dash-offset {
		from {
			stroke-dashoffset: 0;
		}
		to {
			stroke-dashoffset: -10;
		}
	}

	:global(.evil-composed-animated-dash) {
		animation: evil-composed-dash-offset 1s linear infinite;
	}

	@media (prefers-reduced-motion: reduce) {
		:global(.evil-composed-animated-dash) {
			animation: none;
		}
	}
</style>
