<script lang="ts">
	/**
	 * A single bar series. Each <Bar /> is fully self-contained: it generates its
	 * own gradient/pattern definitions under a unique id, so any number of bars —
	 * each with its own variant, radius, glow, and clickability — can live in one
	 * chart without style collisions.
	 */
	import { Bar as LayerBar, getChartContext } from 'layerchart';
	import { useReducedMotion } from '@humanspeak/svelte-motion';
	import { useBarChart } from './bar-chart-context.svelte.js';
	import ColorGradient from './defs/color-gradient.svelte';
	import BufferHatchedPattern from './defs/buffer-hatched-pattern.svelte';
	import DuotonePattern from './defs/duotone-pattern.svelte';
	import DuotoneReversePattern from './defs/duotone-reverse-pattern.svelte';
	import GlowFilter from './defs/glow-filter.svelte';
	import GradientPattern from './defs/gradient-pattern.svelte';
	import HatchedPattern from './defs/hatched-pattern.svelte';
	import StrippedPattern from './defs/stripped-pattern.svelte';
	import { getBarPositions, type BarInsets } from '../../ui/layerchart-chart/bar-geometry.js';
	import AnimatedGrow from '../../ui/layerchart-chart/animated-grow.svelte';
	import type { DitherVariant } from '../../ui/layerchart-dither/index.js';
	import { getBarGrowProgress, getBarOpacity, getVariantFill } from './helpers.js';
	import type { BarAnimationType, BarVariant } from './types.js';

	let {
		dataKey,
		variant = 'default',
		radius,
		animationType,
		isClickable = false,
		enableHoverHighlight = false,
		glowing = false,
		bufferBar = false,
		barProps,
		ditherVariant
	}: {
		dataKey: string; // series key — must exist on the data and config
		variant?: BarVariant; // fill style for this bar only
		radius?: number; // corner radius — falls back to the chart default
		animationType?: BarAnimationType; // grow-in order — falls back to the chart default
		isClickable?: boolean; // lets this bar be selected by clicking it
		enableHoverHighlight?: boolean; // dims this bar while another bar is hovered
		glowing?: boolean; // applies a soft outer glow to this bar
		bufferBar?: boolean; // renders the last data point as a hatched "buffer" bar
		barProps?: Record<string, unknown>; // escape hatch for raw LayerChart Bar props
		ditherVariant?: DitherVariant; // ordered-dither texture override
	} = $props();

	const chart = useBarChart();
	/** LayerChart's own context, for the category band this bar is placed in. */
	const layer = getChartContext();
	const id = $props.id(); // unique id scopes this bar's style defs

	// Announce this bar so the root can divide the category between every bar it finds,
	// the way Recharts does.
	$effect.pre(() => {
		chart.registerBar(id, dataKey, isClickable);
		return () => chart.registerBar(id, undefined, false);
	});
	// Devices set to "reduce motion" skip the grow-in animation entirely
	const shouldReduceMotion = useReducedMotion();

	const resolvedRadius = $derived(radius ?? chart.barRadius);
	const isSelected = $derived(chart.selectedDataKey === dataKey);

	// The grow-in is a per-frame animation — heavier than a static chart — so
	// `"none"` and the OS reduce-motion preference both opt out of it.
	const revealType = $derived<BarAnimationType>(
		shouldReduceMotion.current ? 'none' : (animationType ?? chart.animationType)
	);

	$effect.pre(() => {
		if (!chart.isLoading && revealType !== 'none') chart.startIntro();
	});

	const isStripped = $derived(variant === 'stripped');
	// Stripped bars round only their top corners; every other variant rounds all four
	const rounded = $derived(isStripped ? ('top' as const) : ('all' as const));

	const filter = $derived(glowing ? `url(#${id}-bar-glow-${dataKey})` : undefined);
	const isDither = $derived(chart.renderStyle === 'dither');
	const resolvedDitherVariant = $derived(ditherVariant ?? chart.ditherVariant);

	/**
	 * This bar's slice of the category, in pixels.
	 *
	 * The chart runs with `bandPadding={0}`, so the band and the step are the same width — the
	 * shape Recharts' arithmetic assumes. `getBarPositions` then divides it exactly as Recharts
	 * does (category gap, inter-bar gaps, whole-pixel widths) and the result is applied as insets,
	 * rather than letting LayerChart nest a second band scale.
	 */
	const bandSize = $derived(
		(chart.isHorizontal ? layer.yScale.bandwidth?.() : layer.xScale.bandwidth?.()) ?? 0
	);

	const slot = $derived.by(() => {
		// Stacked series share one slot, exactly as a Recharts `stackId` does.
		const count = chart.isStacked ? 1 : Math.max(1, chart.barKeys.length);
		const index = chart.isStacked ? 0 : Math.max(0, chart.barKeys.indexOf(dataKey));

		return getBarPositions({
			bandSize,
			count,
			barGap: chart.barGap,
			barCategoryGap: chart.barCategoryGap
		})[index];
	});

	/** Leading/trailing insets that place the bar in its slot along the category axis. */
	const bandInsets = $derived.by<BarInsets>(() => {
		if (!slot) return {};
		const trailing = Math.max(0, bandSize - slot.offset - slot.size);
		return chart.isHorizontal
			? { top: slot.offset, bottom: trailing }
			: { left: slot.offset, right: trailing };
	});

	const cursorClass = $derived(isClickable || enableHoverHighlight ? 'cursor-pointer' : undefined);

	/**
	 * Length of this bar's painted body along the value axis, in pixels.
	 *
	 * The stripped variant's cap is a 2px strip floating 4px clear of the bar's top edge. LayerChart
	 * re-centres a bar when given an explicit `height`/`width` (`Bar.shared` does
	 * `y += (height - props.height) / 2`), so the cap is expressed as insets measured against the
	 * value scale instead.
	 *
	 * A stacked bar's segment runs from the running total below it to the total including it, which
	 * is how LayerChart stacks the series — in config order.
	 */
	function bodyLength(row: Record<string, unknown>) {
		const scale = chart.isHorizontal ? layer.xScale : layer.yScale;
		const valueOf = (key: string) => {
			const value = row[key];
			return typeof value === 'number' && Number.isFinite(value) ? value : 0;
		};

		if (!chart.isStacked) {
			return Math.abs(Number(scale(valueOf(dataKey))) - Number(scale(0)));
		}

		const keys = chart.barKeys.length > 0 ? chart.barKeys : chart.seriesKeys;
		const below = keys
			.slice(0, Math.max(0, keys.indexOf(dataKey)))
			.reduce((total, key) => total + valueOf(key), 0);

		return Math.abs(Number(scale(below + valueOf(dataKey))) - Number(scale(below)));
	}

	/** Insets that turn the bar's own box into the 2px cap sitting 4px above it. */
	function capInsets(row: Record<string, unknown>) {
		const trailing = Math.max(0, bodyLength(row) + 2);
		return chart.isHorizontal
			? { ...bandInsets, left: -4, right: trailing }
			: { ...bandInsets, top: -4, bottom: trailing };
	}

	function select() {
		if (!isClickable) return;
		// Clicking the selected bar clears the selection, otherwise selects it
		chart.selectDataKey(isSelected ? null : dataKey);
	}

	/** The last row renders as the hatched buffer bar when `bufferBar` is set. */
	function isLastBar(index: number) {
		return bufferBar && chart.dataLength > 0 && index === chart.dataLength - 1;
	}

	/**
	 * Everything each row needs to paint, resolved in one derivation.
	 *
	 * Template declaration tags inside a keyed `{#each}` do not reliably re-derive
	 * when an outer value changes, which is what froze the tooltip and the selection dimming
	 * elsewhere in this port.
	 */
	const rows = $derived(
		chart.data.map((row, index) => {
			const last = isLastBar(index);

			return {
				row,
				last,
				grow: getBarGrowProgress(revealType, index, chart.dataLength, chart.introElapsed),
				fill: last ? `url(#${id}-buffer-hatched-${dataKey})` : getVariantFill(variant, id, dataKey),
				fillOpacity: getBarOpacity({
					isClickable,
					selectedDataKey: chart.selectedDataKey,
					dataKey,
					enableHoverHighlight,
					isMouseInChart: chart.isMouseInChart,
					isActive: chart.activeRow === row
				}),
				capInset: isStripped ? capInsets(row) : undefined
			};
		})
	);
</script>

<!-- The root renders the skeleton bars while loading, so real bars step aside -->
{#if !chart.isLoading}
	<!--
		One `<Bar>` per row rather than a single `<Bars>`, so each bar can be wrapped in its own
		staggered grow-in. LayerChart still computes every bar's geometry from the chart scales,
		including stacking and grouping.
	-->
	{#each rows as { row, grow, fill, fillOpacity, last, capInset }, index (index)}
		<g class={cursorClass} onclick={select} role="presentation">
			<!-- Transparent twin outside the grow wrapper keeps the column hoverable from frame one -->
			<LayerBar
				data={row}
				seriesKey={dataKey}
				radius={resolvedRadius}
				{rounded}
				fill="transparent"
				insets={bandInsets}
				motion="none"
				tooltip
			/>
			{#if grow !== null}
				<AnimatedGrow progress={grow} axis={chart.isHorizontal ? 'horizontal' : 'vertical'}>
					{@render painted(row, fill, fillOpacity, last, capInset)}
				</AnimatedGrow>
			{:else}
				{@render painted(row, fill, fillOpacity, last, capInset)}
			{/if}
		</g>
	{/each}

	<defs>
		<ColorGradient {id} {dataKey} config={chart.config} />
		{#if variant === 'hatched'}
			<HatchedPattern {id} {dataKey} />
		{/if}
		{#if variant === 'duotone'}
			<DuotonePattern {id} {dataKey} config={chart.config} />
		{/if}
		{#if variant === 'duotone-reverse'}
			<DuotoneReversePattern {id} {dataKey} config={chart.config} />
		{/if}
		{#if variant === 'gradient'}
			<GradientPattern {id} {dataKey} />
		{/if}
		{#if variant === 'stripped'}
			<StrippedPattern {id} {dataKey} />
		{/if}
		{#if bufferBar}
			<BufferHatchedPattern {id} {dataKey} />
		{/if}
		{#if glowing}
			<GlowFilter {id} {dataKey} />
		{/if}
	</defs>
{/if}

{#snippet painted(
	row: Record<string, unknown>,
	fill: string,
	fillOpacity: number,
	last: boolean,
	capInset: BarInsets | undefined
)}
	<!--
		The painted bar. `insets` shortens it by the reference's 3px so the bar never touches the
		next stacked segment, and the stripped variant adds a solid cap above it.
	-->
	<LayerBar
		data={row}
		seriesKey={dataKey}
		radius={resolvedRadius}
		{rounded}
		fill={isDither ? 'transparent' : fill}
		{fillOpacity}
		{filter}
		stroke={last ? `url(#${id}-colors-${dataKey})` : undefined}
		strokeWidth={last ? 1 : undefined}
		data-evil-dither-mark={isDither ? 'fill' : undefined}
		data-evil-dither-key={isDither ? dataKey : undefined}
		data-evil-dither-variant={isDither ? (last ? 'hatched' : resolvedDitherVariant) : undefined}
		data-evil-dither-glow={isDither && glowing ? 'true' : undefined}
		insets={{ ...bandInsets, ...(chart.isHorizontal ? { right: 3 } : { bottom: 3 }) }}
		motion="none"
		{...barProps}
	/>
	{#if isStripped}
		<!--
			The stripped variant's solid cap: a fixed 2px strip sitting 4px clear of the bar's top
			edge, exactly as the reference draws it. `height`/`width` pin the strip's thickness and
			the negative inset lifts it off the bar.
		-->
		<LayerBar
			data={row}
			seriesKey={dataKey}
			radius={1}
			rounded="all"
			fill={isDither ? 'transparent' : `url(#${id}-colors-${dataKey})`}
			data-evil-dither-mark={isDither ? 'fill' : undefined}
			data-evil-dither-key={isDither ? dataKey : undefined}
			data-evil-dither-variant={isDither ? 'solid' : undefined}
			insets={capInset}
			motion="none"
		/>
	{/if}
{/snippet}
