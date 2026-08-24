<script lang="ts">
	/**
	 * A single bar series. Each <Bar /> is fully self-contained: it generates its
	 * own gradient/pattern definitions under a unique id, so any number of bars —
	 * each with its own variant, glow, and clickability — can live in one chart
	 * without style collisions.
	 */
	import { Bar as LayerBar, getChartContext } from 'layerchart';
	import { useReducedMotion } from '@humanspeak/svelte-motion';
	import { useComposedChart } from './composed-chart-context.svelte.js';
	import BarGlowFilter from './defs/bar-glow-filter.svelte';
	import DuotonePattern from './defs/duotone-pattern.svelte';
	import DuotoneReversePattern from './defs/duotone-reverse-pattern.svelte';
	import GradientPattern from './defs/gradient-pattern.svelte';
	import HatchedPattern from './defs/hatched-pattern.svelte';
	import StrippedPattern from './defs/stripped-pattern.svelte';
	import VerticalColorGradient from './defs/vertical-color-gradient.svelte';
	import { getBarPositions, type BarInsets } from '../../ui/layerchart-chart/bar-geometry.js';
	import AnimatedGrow from '../../ui/layerchart-chart/animated-grow.svelte';
	import type { DitherVariant } from '../../ui/layerchart-dither/index.js';
	import { getBarGrowAnimation, getBarOpacity, getVariantFill } from './helpers.js';
	import { DEFAULT_BAR_RADIUS, type BarVariant, type ComposedAnimationType } from './types.js';

	let {
		dataKey,
		variant = 'default',
		radius = DEFAULT_BAR_RADIUS,
		glow = false,
		animationType,
		isClickable = false,
		enableHoverHighlight = false,
		barProps,
		ditherVariant
	}: {
		dataKey: string; // series key — must exist on the data and config
		variant?: BarVariant; // fill style for this bar only
		radius?: number; // corner radius of the bar in pixels
		glow?: boolean; // applies a soft neon glow to this bar
		animationType?: ComposedAnimationType; // grow-in order — falls back to the chart default
		isClickable?: boolean; // lets this bar be selected by clicking it
		enableHoverHighlight?: boolean; // dims this bar when another column is hovered
		barProps?: Record<string, unknown>; // escape hatch for raw LayerChart Bar props
		ditherVariant?: DitherVariant; // ordered-dither texture override
	} = $props();

	const chart = useComposedChart();
	/** LayerChart's own context, for the y scale the stripped variant's cap measures against. */
	const layer = getChartContext();
	const id = $props.id(); // unique id scopes this bar's style defs
	// Devices set to "reduce motion" skip the grow-in animation entirely
	const shouldReduceMotion = useReducedMotion();

	// Announce this bar so the root can divide the category between every bar it finds,
	// the way Recharts does.
	$effect.pre(() => {
		chart.registerBar(id, dataKey);
		return () => chart.registerBar(id, undefined);
	});

	const isSelected = $derived(chart.selectedDataKey === null || chart.selectedDataKey === dataKey);
	const filter = $derived(glow ? `url(#${id}-glow)` : undefined);
	const isDither = $derived(chart.renderStyle === 'dither');
	const resolvedDitherVariant = $derived(ditherVariant ?? chart.ditherVariant);

	// The grow-in is a per-frame animation — heavier than a static chart — so
	// `"none"` and the OS reduce-motion preference both opt out of it.
	const revealType = $derived<ComposedAnimationType>(
		shouldReduceMotion.current ? 'none' : (animationType ?? chart.animationType)
	);

	const isStripped = $derived(variant === 'stripped');
	const fill = $derived(getVariantFill(variant, id));
	const cursorClass = $derived(isClickable || enableHoverHighlight ? 'cursor-pointer' : undefined);

	/**
	 * This bar's slice of the category, in pixels.
	 *
	 * The chart runs with `bandPadding={0}`, so the band and the step are the same width — the
	 * shape Recharts' arithmetic assumes. `getBarPositions` then divides it exactly as Recharts
	 * does and the result is applied as insets, rather than letting LayerChart nest a second band
	 * scale. Doing it here rather than on the chart also keeps the lines on the full category
	 * width, as Recharts does. See plans/DEVIATIONS.md B-1b.
	 */
	const bandSize = $derived(layer.xScale.bandwidth?.() ?? 0);

	const slot = $derived.by(() => {
		const count = Math.max(1, chart.barKeys.length);
		const index = Math.max(0, chart.barKeys.indexOf(dataKey));

		return getBarPositions({
			bandSize,
			count,
			barGap: chart.barGap,
			barCategoryGap: chart.barCategoryGap
		})[index];
	});

	const bandInsets = $derived(
		slot ? { left: slot.offset, right: Math.max(0, bandSize - slot.offset - slot.size) } : {}
	);

	function select() {
		if (!isClickable) return;
		// Clicking the selected bar clears the selection, otherwise selects it
		chart.selectDataKey(chart.selectedDataKey === dataKey ? null : dataKey);
	}

	/**
	 * Height of the painted body, in pixels.
	 *
	 * The stripped variant's cap is a 2px strip flush with the bar's top edge. LayerChart's
	 * `height` prop re-centres a bar on its value range rather than pinning it to that edge, so
	 * the cap is expressed as a bottom inset measured off the same scale instead.
	 */
	function bodyHeight(row: Record<string, unknown>) {
		const value = Number(row[dataKey]);
		if (!Number.isFinite(value)) return 0;
		return Math.abs(layer.yScale(value) - layer.yScale(0));
	}

	/**
	 * Everything each row needs to paint, resolved in one derivation.
	 *
	 * A `{const}` inside the keyed `{#each}` below does not re-derive when the selection changes,
	 * so the per-row values are computed here where they track it properly.
	 * See plans/DEVIATIONS.md A-6.
	 */
	const rows = $derived(
		chart.data.map((row, index) => ({
			row,
			grow: getBarGrowAnimation(revealType, index, chart.dataLength, chart.introStartedAt),
			opacity: getBarOpacity({
				isClickable,
				isSelected,
				selectedDataKey: chart.selectedDataKey,
				enableHoverHighlight,
				hoveredIndex: chart.hoveredIndex,
				index
			}),
			capInset: isStripped ? { ...bandInsets, bottom: Math.max(0, bodyHeight(row) - 2) } : undefined
		}))
	);
</script>

<!-- The root renders the skeleton bar while loading, so real bars step aside -->
{#if !chart.isLoading}
	<!--
		One `<Bar>` per row rather than a single `<Bars>`, so each bar can be wrapped in its own
		staggered grow-in. LayerChart still computes every bar's geometry from the chart scales.
	-->
	{#each rows as { row, grow, opacity, capInset }, index (index)}
		<g class={cursorClass} onclick={select} role="presentation">
			<!--
				Full-height transparent twin, outside the grow wrapper: it keeps the column hoverable
				even mid grow-in, which is what the reference's `hitArea` rect does.
			-->
			<LayerBar
				data={row}
				seriesKey={dataKey}
				fill="transparent"
				insets={bandInsets}
				motion="none"
				tooltip
			/>
			{#if grow}
				<AnimatedGrow animation={grow}>
					{@render painted(row, opacity, capInset)}
				</AnimatedGrow>
			{:else}
				{@render painted(row, opacity, capInset)}
			{/if}
		</g>
	{/each}

	<defs>
		<VerticalColorGradient {id} {dataKey} config={chart.config} />
		{#if variant === 'hatched'}
			<HatchedPattern {id} />
		{/if}
		{#if variant === 'duotone'}
			<DuotonePattern {id} {dataKey} config={chart.config} />
		{/if}
		{#if variant === 'duotone-reverse'}
			<DuotoneReversePattern {id} {dataKey} config={chart.config} />
		{/if}
		{#if variant === 'gradient'}
			<GradientPattern {id} />
		{/if}
		{#if variant === 'stripped'}
			<StrippedPattern {id} />
		{/if}
		{#if glow}
			<BarGlowFilter {id} />
		{/if}
	</defs>
{/if}

{#snippet painted(row: Record<string, unknown>, opacity: number, capInset: BarInsets | undefined)}
	{#if isStripped}
		<!--
			The stripped variant: a square-cornered body plus a solid 2px strip flush with its top
			edge. The glow and the dim both apply to the pair, so they are set on the wrapper.
		-->
		<g {filter} {opacity} class="transition-opacity duration-200">
			<LayerBar
				data={row}
				seriesKey={dataKey}
				radius={0}
				fill={isDither ? 'transparent' : fill}
				opacity={isDither ? opacity : undefined}
				data-evil-dither-mark={isDither ? 'fill' : undefined}
				data-evil-dither-key={isDither ? dataKey : undefined}
				data-evil-dither-variant={isDither ? resolvedDitherVariant : undefined}
				data-evil-dither-glow={isDither && glow ? 'true' : undefined}
				insets={bandInsets}
				motion="none"
			/>
			<LayerBar
				data={row}
				seriesKey={dataKey}
				radius={0}
				insets={capInset}
				fill={isDither ? 'transparent' : `url(#${id}-bar-colors)`}
				opacity={isDither ? opacity : undefined}
				data-evil-dither-mark={isDither ? 'fill' : undefined}
				data-evil-dither-key={isDither ? dataKey : undefined}
				data-evil-dither-variant={isDither ? 'solid' : undefined}
				motion="none"
			/>
		</g>
	{:else}
		<LayerBar
			data={row}
			seriesKey={dataKey}
			{radius}
			rounded="all"
			fill={isDither ? 'transparent' : fill}
			{opacity}
			{filter}
			insets={bandInsets}
			class="transition-opacity duration-200"
			data-evil-dither-mark={isDither ? 'fill' : undefined}
			data-evil-dither-key={isDither ? dataKey : undefined}
			data-evil-dither-variant={isDither ? resolvedDitherVariant : undefined}
			data-evil-dither-glow={isDither && glow ? 'true' : undefined}
			motion="none"
			{...barProps}
		/>
	{/if}
{/snippet}
