<script lang="ts">
	/**
	 * A single line series. Each <Line /> is fully self-contained: it generates its
	 * own gradient and glow definitions under a unique id, so any number of lines —
	 * each with its own stroke, glow, and clickability — can live in one chart
	 * without style collisions. Compose <Dot /> and <ActiveDot /> inside it to add
	 * point markers.
	 */
	import { getChartContext, Highlight, Points, Spline } from 'layerchart';
	import { useReducedMotion } from '@humanspeak/svelte-motion';
	import type { Snippet } from 'svelte';
	import { resolveCurve } from '../../ui/layerchart-chart/curves.js';
	import { ChartDot } from '../../ui/layerchart-dot/index.js';
	import type { DitherVariant } from '../../ui/layerchart-dither/index.js';
	import { bufferLine } from './buffer-line.svelte.js';
	import ColorGradient from './defs/color-gradient.svelte';
	import GlowFilter from './defs/glow-filter.svelte';
	import RevealMask from './defs/reveal-mask.svelte';
	import { getOpacity, getStrokeDasharray } from './helpers.js';
	import { useLineChart } from './line-chart-context.svelte.js';
	import { setLineSlotsContext } from './line-slots.svelte.js';
	import {
		STROKE_WIDTH,
		type CurveType,
		type LineAnimationType,
		type StrokeVariant
	} from './types.js';

	let {
		dataKey,
		strokeVariant = 'solid',
		strokeWidth = STROKE_WIDTH,
		curveType,
		animationType,
		connectNulls = false,
		isClickable = false,
		glowing = false,
		enableBufferLine = false,
		children,
		lineProps,
		ditherVariant
	}: {
		dataKey: string; // series key — must exist on the data and config
		strokeVariant?: StrokeVariant; // stroke style for this line only
		strokeWidth?: number; // stroke thickness in pixels for this line
		curveType?: CurveType; // curve interpolation — falls back to the chart default
		animationType?: LineAnimationType; // intro reveal — falls back to the chart default
		connectNulls?: boolean; // join segments across null/missing values
		isClickable?: boolean; // lets this line be selected by clicking it
		glowing?: boolean; // applies a soft outer glow to this line
		enableBufferLine?: boolean; // renders this line's last segment as a dashed buffer
		children?: Snippet; // optional <Dot /> and <ActiveDot /> composition
		lineProps?: Record<string, unknown>; // escape hatch for raw LayerChart Spline props
		ditherVariant?: DitherVariant; // ordered-dither texture override
	} = $props();

	const chart = useLineChart();
	/** LayerChart's own context, for the scales the buffer line needs to measure against. */
	const layer = getChartContext();
	const id = $props.id(); // unique id scopes this line's style defs
	// Devices set to "reduce motion" skip the intro reveal entirely
	const shouldReduceMotion = useReducedMotion();

	const slots = setLineSlotsContext();

	const resolvedCurve = $derived(curveType ?? chart.curveType);

	// The reveal is an animated SVG mask — heavier than a static chart — so
	// `"none"` and the OS reduce-motion preference both opt out of it.
	const revealType = $derived<LineAnimationType>(
		shouldReduceMotion.current ? 'none' : (animationType ?? chart.animationType)
	);
	const maskId = $derived(revealType === 'none' ? undefined : `${id}-reveal-mask`);

	const isSelected = $derived(chart.selectedDataKey === dataKey);
	const hasSelection = $derived(chart.selectedDataKey !== null);
	const opacity = $derived(getOpacity(chart.selectedDataKey, dataKey));

	const dotVariant = $derived(slots.dot?.variant);
	const activeDotVariant = $derived(slots.activeDot?.variant);

	const isAnimatedDashed = $derived(strokeVariant === 'animated-dashed');
	const isDashed = $derived(strokeVariant === 'dashed' || isAnimatedDashed);
	const isDither = $derived(chart.renderStyle === 'dither' && !isAnimatedDashed);
	const resolvedDitherVariant = $derived(ditherVariant ?? chart.ditherVariant);

	/**
	 * x of the second-to-last point — where the buffer line's solid run meets the dashes.
	 * Read straight off LayerChart's x scale so it stays in sync with resizes and brush filtering.
	 */
	const splitX = $derived.by(() => {
		if (!enableBufferLine) return undefined;
		const rows = chart.data;
		const row = rows[rows.length - 2];
		if (!row || !chart.xKey) return undefined;
		const scaled = layer.xScale(row[chart.xKey] as never);
		return typeof scaled === 'number' ? scaled : undefined;
	});

	function select() {
		if (!isClickable) return;
		// Clicking the selected line clears the selection, otherwise selects it
		chart.selectDataKey(isSelected ? null : dataKey);
	}
</script>

<!-- The root renders the skeleton line while loading, so real lines step aside -->
{#if !chart.isLoading}
	{@render children?.()}

	<g>
		{#if isClickable}
			<!-- Invisible fat stroke: a 15px hit area so the thin line is easy to click -->
			<Spline
				seriesKey={dataKey}
				curve={resolveCurve(resolvedCurve)}
				stroke="transparent"
				strokeWidth={15}
				defined={connectNulls
					? undefined
					: (d: Record<string, unknown>) => d[dataKey] !== null && d[dataKey] !== undefined}
				motion="none"
				class="cursor-pointer"
				onclick={select}
			/>
		{/if}
		<g {@attach enableBufferLine ? bufferLine(() => splitX) : undefined}>
			<Spline
				seriesKey={dataKey}
				curve={resolveCurve(resolvedCurve)}
				strokeOpacity={opacity.stroke}
				stroke={isDither ? 'transparent' : `url(#${id}-colors-${dataKey})`}
				{strokeWidth}
				stroke-dasharray={getStrokeDasharray(enableBufferLine, isDashed)}
				filter={glowing ? `url(#${id}-glow-${dataKey})` : undefined}
				defined={connectNulls
					? undefined
					: (d: Record<string, unknown>) => d[dataKey] !== null && d[dataKey] !== undefined}
				mask={maskId ? `url(#${maskId})` : undefined}
				data-evil-dither-mark={isDither ? 'stroke' : undefined}
				data-evil-dither-key={isDither ? dataKey : undefined}
				data-evil-dither-variant={isDither ? resolvedDitherVariant : undefined}
				data-evil-dither-reveal={isDither ? revealType : undefined}
				data-evil-dither-glow={isDither && glowing ? 'true' : undefined}
				class={[
					isClickable && 'cursor-pointer',
					isAnimatedDashed && !hasSelection && 'evil-line-animated-dash'
				]
					.filter(Boolean)
					.join(' ') || undefined}
				onclick={select}
				motion="none"
				{...lineProps}
			/>
		</g>
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
		<ColorGradient {id} {dataKey} config={chart.config} isExpanded={false} />
		{#if glowing}
			<GlowFilter {id} {dataKey} />
		{/if}
	</defs>
{/if}

<style>
	/*
		Move a fixed dash pattern along the stroke. Animating the dash lengths makes the visible dash
		shrink to zero every half-cycle, which reads as a flicker instead of directional motion.
	*/
	@keyframes evil-line-dash-offset {
		from {
			stroke-dashoffset: 0;
		}
		to {
			stroke-dashoffset: -10;
		}
	}

	:global(.evil-line-animated-dash) {
		animation: evil-line-dash-offset 1s linear infinite;
	}

	@media (prefers-reduced-motion: reduce) {
		:global(.evil-line-animated-dash) {
			animation: none;
		}
	}
</style>
