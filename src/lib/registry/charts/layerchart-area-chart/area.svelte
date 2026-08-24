<script lang="ts">
	/**
	 * A single area series. Each <Area /> is fully self-contained: it generates its
	 * own gradient/pattern definitions under a unique id, so any number of areas —
	 * each with its own variant, stroke, and clickability — can live in one chart
	 * without style collisions. Compose <Dot /> and <ActiveDot /> inside it to add
	 * point markers.
	 */
	import { Area as LayerArea, Highlight, Points } from 'layerchart';
	import { useReducedMotion } from '@humanspeak/svelte-motion';
	import type { Snippet } from 'svelte';
	import { resolveCurve } from '../../ui/layerchart-chart/curves.js';
	import { ChartDot } from '../../ui/layerchart-dot/index.js';
	import type { DitherVariant } from '../../ui/layerchart-dither/index.js';
	import { useAreaChart } from './area-chart-context.svelte.js';
	import { setAreaSlotsContext } from './area-slots.svelte.js';
	import ColorGradient from './defs/color-gradient.svelte';
	import DottedPattern from './defs/dotted-pattern.svelte';
	import GradientPattern from './defs/gradient-pattern.svelte';
	import HatchedPattern from './defs/hatched-pattern.svelte';
	import LinesPattern from './defs/lines-pattern.svelte';
	import ReverseGradientPattern from './defs/reverse-gradient-pattern.svelte';
	import RevealMask from './defs/reveal-mask.svelte';
	import SolidPattern from './defs/solid-pattern.svelte';
	import UnselectedPattern from './defs/unselected-pattern.svelte';
	import { getFillPattern, getOpacity } from './helpers.js';
	import {
		STROKE_WIDTH,
		type AreaAnimationType,
		type AreaVariant,
		type CurveType,
		type StrokeVariant
	} from './types.js';

	let {
		dataKey,
		variant = 'gradient',
		strokeVariant = 'dashed',
		strokeWidth = STROKE_WIDTH,
		curveType,
		animationType,
		connectNulls = false,
		isClickable = false,
		children,
		areaProps,
		ditherVariant
	}: {
		dataKey: string; // series key — must exist on the data and config
		variant?: AreaVariant; // fill style for this area only
		strokeVariant?: StrokeVariant; // stroke style for this area
		strokeWidth?: number; // stroke thickness in pixels for this area
		curveType?: CurveType; // curve interpolation — falls back to the chart default
		animationType?: AreaAnimationType; // intro reveal — falls back to the chart default
		connectNulls?: boolean; // join segments across null/missing values
		isClickable?: boolean; // lets this area be selected by clicking it
		children?: Snippet; // optional <Dot /> and <ActiveDot /> composition
		areaProps?: Record<string, unknown>; // escape hatch for raw LayerChart Area props
		ditherVariant?: DitherVariant; // ordered-dither texture override
	} = $props();

	const chart = useAreaChart();
	const id = $props.id(); // unique id scopes this area's style defs
	// Devices set to "reduce motion" skip the intro reveal entirely
	const shouldReduceMotion = useReducedMotion();

	const slots = setAreaSlotsContext();

	const resolvedCurve = $derived(curveType ?? chart.curveType);

	// The reveal is an animated SVG mask — heavier than a static chart — so
	// `"none"` and the OS reduce-motion preference both opt out of it.
	const revealType = $derived<AreaAnimationType>(
		shouldReduceMotion.current ? 'none' : (animationType ?? chart.animationType)
	);
	const maskId = $derived(revealType === 'none' ? undefined : `${id}-reveal-mask`);

	const isSelected = $derived(chart.selectedDataKey === dataKey);
	const hasSelection = $derived(chart.selectedDataKey !== null);
	const opacity = $derived(getOpacity(chart.selectedDataKey, dataKey));
	const showUnselected = $derived(hasSelection && !isSelected);

	// Read outside the snippets below: TypeScript cannot narrow `slots.dot` across a
	// snippet boundary, and the variant is all the markers need.
	const dotVariant = $derived(slots.dot?.variant);
	const activeDotVariant = $derived(slots.activeDot?.variant);

	const isAnimatedDashed = $derived(strokeVariant === 'animated-dashed');
	const isDashed = $derived(strokeVariant === 'dashed' || isAnimatedDashed);
	const isDither = $derived(chart.renderStyle === 'dither');
	const resolvedDitherVariant = $derived(ditherVariant ?? chart.ditherVariant);
</script>

<!-- The root renders the skeleton area while loading, so real areas step aside -->
{#if !chart.isLoading}
	{@render children?.()}

	<!--
		Fill and stroke are two paths, as in the reference: Recharts renders the area's fill with
		`stroke="none"` and the top curve as a separate stroked path, so the closing bottom edge is
		never stroked. LayerChart's `line` prop is that second path.

		The reveal mask goes on a wrapping `<g>` rather than on `<Area mask>`: LayerChart forwards
		`mask` to the *fill* path only, so the top curve appeared instantly while the fill wiped in.
		The reference puts the mask on the element's `style`, which covers both. See
		plans/DEVIATIONS.md A-13.
	-->
	<g mask={maskId ? `url(#${maskId})` : undefined}>
		<LayerArea
			seriesKey={dataKey}
			curve={resolveCurve(resolvedCurve)}
			fillOpacity={opacity.fill}
			fill={isDither ? 'transparent' : getFillPattern(variant, showUnselected, id)}
			stroke="none"
			data-evil-dither-mark={isDither ? 'fill' : undefined}
			data-evil-dither-key={isDither ? dataKey : undefined}
			data-evil-dither-variant={isDither ? resolvedDitherVariant : undefined}
			data-evil-dither-reverse={isDither && variant === 'gradient-reverse' ? 'true' : undefined}
			data-evil-dither-reveal={isDither ? revealType : undefined}
			line={{
				stroke: isDither && !isAnimatedDashed ? 'transparent' : `url(#${id}-colors-${dataKey})`,
				strokeOpacity: opacity.stroke,
				strokeWidth,
				'stroke-dasharray': isDashed ? '3 3' : undefined,
				class: isAnimatedDashed && !hasSelection ? 'evil-animated-dash' : undefined,
				'data-evil-dither-mark': isDither && !isAnimatedDashed ? 'stroke' : undefined,
				'data-evil-dither-key': isDither && !isAnimatedDashed ? dataKey : undefined,
				'data-evil-dither-variant':
					isDither && !isAnimatedDashed ? resolvedDitherVariant : undefined,
				'data-evil-dither-reveal': isDither && !isAnimatedDashed ? revealType : undefined
			}}
			defined={connectNulls
				? undefined
				: (d: Record<string, unknown>) => d[dataKey] !== null && d[dataKey] !== undefined}
			class={isClickable ? 'cursor-pointer' : undefined}
			onclick={() => {
				if (!isClickable) return;
				// Clicking the selected area clears the selection, otherwise selects it
				chart.selectDataKey(isSelected ? null : dataKey);
			}}
			motion="none"
			{...areaProps}
		/>
	</g>

	{#if slots.dot}
		<!-- Resting point markers, wired to the intro reveal so they wipe in with the line -->
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
						chartId={id}
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
		<ColorGradient {id} {dataKey} config={chart.config} isExpanded={chart.isExpanded} />
		{#if variant === 'gradient'}
			<GradientPattern {id} {dataKey} />
		{/if}
		{#if variant === 'gradient-reverse'}
			<ReverseGradientPattern {id} {dataKey} />
		{/if}
		{#if variant === 'solid'}
			<SolidPattern {id} {dataKey} />
		{/if}
		{#if variant === 'dotted'}
			<DottedPattern {id} {dataKey} />
		{/if}
		{#if variant === 'lines'}
			<LinesPattern {id} {dataKey} />
		{/if}
		{#if variant === 'hatched'}
			<HatchedPattern {id} {dataKey} />
		{/if}
		{#if showUnselected}
			<UnselectedPattern {id} {dataKey} />
		{/if}
	</defs>
{/if}

<style>
	/*
		Move a fixed dash pattern along the stroke. Animating the dash lengths makes the visible dash
		shrink to zero every half-cycle, which reads as a flicker instead of directional motion.
	*/
	@keyframes evil-area-dash-offset {
		from {
			stroke-dashoffset: 0;
		}
		to {
			stroke-dashoffset: -6;
		}
	}

	:global(.evil-animated-dash) {
		animation: evil-area-dash-offset 1s linear infinite;
	}

	@media (prefers-reduced-motion: reduce) {
		:global(.evil-animated-dash) {
			animation: none;
		}
	}
</style>
