<script lang="ts">
	/**
	 * The pie series. Self-contained: it generates its own radial colour gradients and glow
	 * filters under a unique id, so any number of pies — each with its own shape and
	 * clickability — can live on one page without style collisions. While the chart is loading it
	 * renders an animated skeleton in place of the data. Compose <Label /> inside it to draw
	 * labels on each sector.
	 */
	import { Arc, getChartContext } from 'layerchart';
	import { animate, useMotionValue, useReducedMotion } from '@humanspeak/svelte-motion';
	import type { DitherVariant } from '../../ui/layerchart-dither/index.js';
	import type { Snippet } from 'svelte';
	import ColorGradient from './defs/radial-color-gradient.svelte';
	import GlowFilter from './defs/glow-filter.svelte';
	import LoadingSector from './loading/loading-sector.svelte';
	import { usePieChart } from './pie-chart-context.svelte.js';
	import { setPieSlotsContext } from './pie-slots.svelte.js';
	import { getSectors, interpolateSectors, type PieSector } from './sectors.js';
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
		pieProps,
		arcProps,
		ditherVariant
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
		pieProps?: Record<string, unknown>; // canonical escape hatch, matching the original EvilCharts API
		/** @deprecated Use `pieProps`. */
		arcProps?: Record<string, unknown>; // escape hatch for raw LayerChart Arc props
		ditherVariant?: DitherVariant; // ordered-dither texture override
	} = $props();

	const forwardedPieProps = $derived({ ...(arcProps ?? {}), ...(pieProps ?? {}) });

	const chart = usePieChart();
	/** LayerChart's own context, for the plot box the radii are measured against. */
	const layer = getChartContext();
	const id = $props.id(); // unique id scopes this pie's style defs

	const slots = setPieSlotsContext();
	const shouldReduceMotion = useReducedMotion();
	const isDither = $derived(chart.renderStyle === 'dither');
	const resolvedDitherVariant = $derived(ditherVariant ?? chart.ditherVariant);

	const resolvedInner = $derived(toArcRadius(innerRadius));
	const resolvedOuter = $derived(toArcRadius(outerRadius));

	/**
	 * The intro sweep, reproducing Recharts' own `<Pie>` animation: every sector grows to its
	 * final span together, so the pie unrolls from its start angle. Same begin, duration and
	 * easing curve as `<Pie animationBegin animationDuration animationEasing>`.
	 */
	const progress = useMotionValue(1);
	let sourceSectors = $state<PieSector[]>([]);
	let targetSectors = $state<PieSector[]>([]);
	let previousLoading: boolean | undefined;

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

	const resolvedSectors = $derived(
		getSectors({
			rows: chart.isLoading ? loadingRows : chart.data,
			dataKey: chart.dataKey,
			startAngle,
			endAngle,
			paddingAngle
		})
	);

	// Recharts animates every change to the pie's sector geometry, not only the first render. Keep
	// the currently painted sectors as the next animation's source so interrupted updates remain
	// continuous. `untrack` prevents per-frame motion-value reads from restarting the tween.
	$effect(() => {
		const loadingNow = chart.isLoading;
		const nextSectors = resolvedSectors;
		const reduceMotion = shouldReduceMotion.current;
		let controls: ReturnType<typeof animate> | undefined;

		untrack(() => {
			if (loadingNow) {
				sourceSectors = nextSectors;
				targetSectors = nextSectors;
				progress.set(1);
			} else {
				const entering = previousLoading === undefined || previousLoading;
				const currentSectors = entering
					? []
					: interpolateSectors(sourceSectors, targetSectors, progress.get());

				sourceSectors = currentSectors;
				targetSectors = nextSectors;

				if (reduceMotion) {
					progress.set(1);
				} else {
					progress.set(0);
					controls = animate(progress, 1, {
						delay: ANIMATION_BEGIN / 1000,
						duration: ANIMATION_DURATION / 1000,
						ease: ANIMATION_EASE
					});
				}
			}
			previousLoading = loadingNow;
		});

		return () => controls?.stop();
	});

	const rawSectors = $derived(
		chart.isLoading
			? resolvedSectors
			: interpolateSectors(sourceSectors, targetSectors, progress.current)
	);
	const isAnimating = $derived(
		!chart.isLoading && !shouldReduceMotion.current && progress.current < 1
	);

	/**
	 * Sectors with their name resolved.
	 *
	 * A declaration tag inside the keyed `{#each}` below would not re-derive when the row at an
	 * index changes, so the name — which drives the fill, the glow and the click target — is
	 * resolved here.
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
	 * the angles the arc had on its first frame.
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

	function selectFromKeyboard(event: KeyboardEvent, sectorName: string) {
		if (!isClickable || (event.key !== 'Enter' && event.key !== ' ')) return;
		event.preventDefault();
		select(sectorName);
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
			data-evil-animation-state={isAnimating ? 'running' : 'idle'}
			startAngle={toArcAngle(sector.startAngle)}
			endAngle={toArcAngle(sector.endAngle)}
			innerRadius={resolvedInner}
			outerRadius={resolvedOuter}
			{cornerRadius}
			fill={isDither ? 'transparent' : `url(#${id}-colors-${sector.name})`}
			filter={glowingSectors.includes(sector.name) ? `url(#${id}-glow-${sector.name})` : undefined}
			stroke={overlapping ? 'var(--background)' : 'none'}
			strokeWidth={overlapping ? 5 : 0}
			opacity={isClickable && chart.selectedSector !== null && chart.selectedSector !== sector.name
				? 0.15
				: 1}
			data-evil-dither-mark={isDither ? 'fill' : undefined}
			data-evil-dither-key={isDither ? sector.name : undefined}
			data-evil-dither-variant={isDither ? resolvedDitherVariant : undefined}
			data-evil-dither-glow={isDither && glowingSectors.includes(sector.name) ? 'true' : undefined}
			data={sector.row}
			tooltip
			motion="none"
			role={isClickable ? 'button' : 'presentation'}
			tabindex={isClickable ? 0 : undefined}
			aria-label={isClickable
				? `${sector.name}: ${String(sector.row[chart.dataKey] ?? '')}`
				: undefined}
			aria-pressed={isClickable ? chart.selectedSector === sector.name : undefined}
			onkeydown={(event: KeyboardEvent) => selectFromKeyboard(event, sector.name)}
			onclick={() => select(sector.name)}
			{...forwardedPieProps}
		/>
	{/each}

	{#if label && !isAnimating}
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
