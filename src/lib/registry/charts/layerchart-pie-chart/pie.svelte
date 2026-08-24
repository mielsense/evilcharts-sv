<script lang="ts">
	/**
	 * The pie series. Self-contained: it generates its own radial colour gradients and glow
	 * filters under a unique id, so any number of pies — each with its own shape and
	 * clickability — can live on one page without style collisions. While the chart is loading it
	 * renders an animated skeleton in place of the data. Compose <Label /> inside it to draw
	 * labels on each sector.
	 */
	import { Arc, getChartContext } from 'layerchart';
	import { animate, useMotionValue } from '@humanspeak/svelte-motion';
	import type { Snippet } from 'svelte';
	import ColorGradient from './defs/radial-color-gradient.svelte';
	import GlowFilter from './defs/glow-filter.svelte';
	import LoadingSector from './loading/loading-sector.svelte';
	import { usePieChart } from './pie-chart-context.svelte.js';
	import { setPieSlotsContext } from './pie-slots.svelte.js';
	import { getSectors } from './sectors.js';
	import { untrack } from 'svelte';
	import {
		ANIMATION_BEGIN,
		ANIMATION_DURATION,
		ANIMATION_EASE,
		DEFAULT_CORNER_RADIUS,
		DEFAULT_END_ANGLE,
		DEFAULT_INNER_RADIUS,
		DEFAULT_OUTER_RADIUS,
		DEFAULT_PADDING_ANGLE,
		DEFAULT_START_ANGLE,
		LOADING_PIE_DATA,
		polarToCartesian,
		resolveRadii,
		toArcAngle,
		toArcRadius,
		type PieVariant
	} from './types.js';

	let {
		variant = 'gradient',
		innerRadius = DEFAULT_INNER_RADIUS,
		outerRadius = DEFAULT_OUTER_RADIUS,
		cornerRadius = DEFAULT_CORNER_RADIUS,
		paddingAngle = DEFAULT_PADDING_ANGLE,
		startAngle = DEFAULT_START_ANGLE,
		endAngle = DEFAULT_END_ANGLE,
		isClickable = false,
		glowingSectors = [],
		children,
		arcProps
	}: {
		variant?: PieVariant; // fill style for the pie's sectors
		innerRadius?: number | string; // inner radius — set above 0 for a donut
		outerRadius?: number | string; // outer radius of the pie
		cornerRadius?: number; // border-radius of each sector in pixels
		paddingAngle?: number; // gap between sectors in degrees — negative overlaps them
		startAngle?: number; // angle the pie starts drawing from
		endAngle?: number; // angle the pie stops drawing at
		isClickable?: boolean; // lets sectors be selected by clicking them
		glowingSectors?: string[]; // sector names that render with a soft outer glow
		children?: Snippet; // optional <Label /> composition for sector labels
		arcProps?: Record<string, unknown>; // escape hatch for raw LayerChart Arc props
	} = $props();

	const chart = usePieChart();
	/** LayerChart's own context, for the plot box the radii are measured against. */
	const layer = getChartContext();
	const id = $props.id(); // unique id scopes this pie's style defs

	const slots = setPieSlotsContext();

	const resolvedInner = $derived(toArcRadius(innerRadius));
	const resolvedOuter = $derived(toArcRadius(outerRadius));

	/**
	 * The intro sweep, reproducing Recharts' own `<Pie>` animation: every sector grows to its
	 * final span together, so the pie unrolls from its start angle. Same begin, duration and
	 * easing curve as `<Pie animationBegin animationDuration animationEasing>`.
	 */
	const progress = useMotionValue(0);

	// `untrack`: `animate` reads the motion value, and a tracked read would re-run this effect
	// on every frame — each run restarting the tween, so it crawled instead of playing once.
	$effect(() => {
		const controls = untrack(() =>
			animate(progress, 1, {
				delay: ANIMATION_BEGIN / 1000,
				duration: ANIMATION_DURATION / 1000,
				ease: ANIMATION_EASE
			})
		);
		return () => controls.stop();
	});

	/**
	 * The skeleton's equal sectors, re-keyed onto the chart's own name/value keys so the same
	 * accessors work for both.
	 */
	const loadingRows = $derived(
		LOADING_PIE_DATA.map((row) => ({
			[chart.nameKey]: row.name,
			[chart.dataKey]: row.value
		}))
	);

	const rawSectors = $derived(
		getSectors({
			rows: chart.isLoading ? loadingRows : chart.data,
			dataKey: chart.dataKey,
			startAngle,
			endAngle,
			paddingAngle,
			// The skeleton is a static ring; only the real pie sweeps in.
			progress: chart.isLoading ? 1 : progress.current
		})
	);

	/**
	 * Sectors with their name resolved.
	 *
	 * A declaration tag inside the keyed `{#each}` below would not re-derive when the row at an
	 * index changes, so the name — which drives the fill, the glow and the click target — is
	 * resolved here. See plans/DEVIATIONS.md A-6c.
	 */
	const sectors = $derived(
		rawSectors.map((sector) => ({ ...sector, name: String(sector.row[chart.nameKey]) }))
	);

	/**
	 * A negative `paddingAngle` overlaps the sectors, so the reference separates them with a thick
	 * background-coloured outline instead of a gap.
	 */
	const overlapping = $derived(paddingAngle < 0);

	const label = $derived(slots.label);
	const labelKey = $derived(label?.dataKey ?? chart.dataKey);

	/**
	 * Label anchors, in the same pixel space as the arcs.
	 *
	 * Recharts' `<LabelList>` defaults a polar view box to `position="middle"`: the sector's
	 * mid-angle at `(innerRadius + outerRadius) / 2`. That is computed here rather than read from
	 * `<Arc>`'s `centroid` snippet parameter, which does not track the intro sweep — it stays at
	 * the angles the arc had on its first frame. See plans/DEVIATIONS.md D-2.
	 */
	const radii = $derived(
		resolveRadii(resolvedInner, resolvedOuter, Math.min(layer.width, layer.height) / 2)
	);
	const labelAnchors = $derived(
		sectors.map((sector) =>
			polarToCartesian((radii.inner + radii.outer) / 2, (sector.startAngle + sector.endAngle) / 2)
		)
	);

	function select(sectorName: string) {
		if (!isClickable) return;
		// Clicking the selected sector clears the selection, otherwise selects it
		chart.selectSector(chart.selectedSector === sectorName ? null : sectorName);
	}
</script>

{@render children?.()}

{#if chart.isLoading}
	{#each sectors as sector (sector.index)}
		<LoadingSector
			index={sector.index}
			startAngle={toArcAngle(sector.startAngle)}
			endAngle={toArcAngle(sector.endAngle)}
			innerRadius={resolvedInner}
			outerRadius={resolvedOuter}
			{cornerRadius}
		/>
	{/each}
{:else}
	{#each sectors as sector (sector.index)}
		<Arc
			class={['lc-pie-arc transition-opacity duration-200', isClickable && 'cursor-pointer']
				.filter(Boolean)
				.join(' ')}
			startAngle={toArcAngle(sector.startAngle)}
			endAngle={toArcAngle(sector.endAngle)}
			innerRadius={resolvedInner}
			outerRadius={resolvedOuter}
			{cornerRadius}
			fill={`url(#${id}-colors-${sector.name})`}
			filter={glowingSectors.includes(sector.name) ? `url(#${id}-glow-${sector.name})` : undefined}
			stroke={overlapping ? 'var(--background)' : 'none'}
			strokeWidth={overlapping ? 5 : 0}
			opacity={isClickable && chart.selectedSector !== null && chart.selectedSector !== sector.name
				? 0.15
				: 1}
			data={sector.row}
			tooltip
			motion="none"
			onclick={() => select(sector.name)}
			{...arcProps}
		/>
	{/each}

	{#if label}
		{#each sectors as sector, index (sector.index)}
			<!--
				`dy` matches the `0.355em` Recharts' `<Text>` emits for a single line with
				`verticalAnchor="middle"`; the rest of the attributes are the reference's
				`<LabelList>` defaults.
			-->
			<text
				x={labelAnchors[index][0]}
				y={labelAnchors[index][1]}
				dy="0.355em"
				text-anchor="middle"
				stroke="none"
				font-size={12}
				font-weight={500}
				fill="currentColor"
				class="fill-background"
				{...label.labelProps}
			>
				{sector.row[labelKey]}
			</text>
		{/each}
	{/if}

	<defs>
		<ColorGradient {id} config={chart.config} {variant} />
		{#if glowingSectors.length > 0}
			<GlowFilter {id} {glowingSectors} />
		{/if}
	</defs>
{/if}
