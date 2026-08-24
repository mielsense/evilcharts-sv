<script lang="ts" generics="TData extends Record<string, unknown>">
	/**
	 * Root of the composable radar chart. Owns the data, the shared context, and the loading
	 * skeleton. Everything visual — the polar grid, axes, tooltip, legend, and the radars
	 * themselves — is composed as children, so a consumer renders exactly the parts they need.
	 */
	import { Chart, Group, Html, Svg, type ChartState } from 'layerchart';
	import { untrack, type Snippet } from 'svelte';
	import {
		ChartContainer,
		LoadingIndicator,
		type ChartConfig
	} from '../../ui/layerchart-chart/index.js';
	import { ChartBackground, type BackgroundVariant } from '../../ui/layerchart-background/index.js';
	import LegendRender from './legend-render.svelte';
	import LoadingRadar from './loading/loading-radar.svelte';
	import { LoadingDataState } from './loading/use-loading-data.svelte.js';
	import { setRadarChartContext } from './radar-chart-context.svelte.js';
	import {
		DitherDomLayer,
		type DitherBloom,
		type DitherVariant,
		type RenderStyle
	} from '../../ui/layerchart-dither/index.js';
	import TooltipRender from './tooltip-render.svelte';
	import {
		DEFAULT_OUTER_RADIUS_RATIO,
		LOADING_POINTS,
		LOADING_RADAR_DATA_KEY,
		REVEAL_BEGIN,
		REVEAL_DURATION
	} from './types.js';

	let {
		config,
		data,
		children,
		class: className,
		chartProps,
		backgroundVariant,
		defaultSelectedDataKey = null,
		onSelectionChange,
		isLoading = false,
		loadingPoints,
		initialDimension = { width: 320, height: 200 },
		renderStyle = 'svg',
		ditherVariant = 'gradient',
		ditherCellSize = 2,
		bloom = 'off'
	}: {
		config: ChartConfig; // series colors + labels
		data: TData[]; // rows rendered by the chart
		children: Snippet; // composed parts — <Radar />, <PolarGrid />, <Legend />, …
		class?: string; // extra classes for the chart container
		chartProps?: Record<string, unknown>; // escape hatch for the raw LayerChart Chart
		backgroundVariant?: BackgroundVariant; // background pattern drawn behind the chart
		defaultSelectedDataKey?: string | null; // series selected on first render
		onSelectionChange?: (selectedDataKey: string | null) => void; // fires when the selected series changes
		isLoading?: boolean; // shows the animated loading skeleton
		loadingPoints?: number; // number of points in the loading skeleton
		initialDimension?: { width: number; height: number }; // zero-size/first-render fallback
		renderStyle?: RenderStyle;
		ditherVariant?: DitherVariant;
		ditherCellSize?: number;
		bloom?: DitherBloom;
	} = $props();

	// One-time initialisation, mirroring the reference's `useState(defaultSelectedDataKey)`.
	let selectedDataKey = $state<string | null>(untrack(() => defaultSelectedDataKey));
	let chartDimension = $state(untrack(() => initialDimension));
	let introStartedAt = $state(Date.now());
	let previousLoading = untrack(() => isLoading);

	$effect(() => {
		const loadingNow = isLoading;
		if (previousLoading && !loadingNow) introStartedAt = Date.now();
		previousLoading = loadingNow;
	});

	/** LayerChart's chart state, so the pointer handlers below can drive the tooltip. */
	let layerContext = $state<ChartState<Record<string, unknown>> | undefined>(undefined);

	const TAU = Math.PI * 2;

	/**
	 * Resolves the hovered category by *angle*, the way Recharts does, and drives the tooltip
	 * manually.
	 *
	 * None of LayerChart's tooltip modes matches: `band` lays out cartesian hit rects, and on a
	 * radial chart a band runs from one vertex to the *next* rather than being centred on it, so
	 * pointing straight up reported the last category instead of the first. `quadtree` picks the
	 * nearest *point*, which drifts into the wrong sector wherever a series dips. The chart
	 * therefore runs `mode: 'manual'` and the handlers here resolve the sector.
	 *
	 * Attached to the wrapper rather than an overlay inside the SVG so a pointer over a radar still
	 * reaches it — an overlay would either sit under the polygons or swallow their clicks.
	 * See plans/DEVIATIONS.md U-5.
	 */
	function showTooltip(event: PointerEvent) {
		const rows = chartData;
		if (rows.length === 0 || !layerContext) return;

		const box = (event.currentTarget as HTMLElement).getBoundingClientRect();
		const dx = event.clientX - (box.x + box.width / 2);
		const dy = event.clientY - (box.y + box.height / 2);

		const angle = (Math.atan2(dx, -dy) + TAU) % TAU;
		const step = TAU / rows.length;
		const index = Math.round(angle / step) % rows.length;

		layerContext.tooltip.show(event, rows[index]);
	}

	const loading = new LoadingDataState({
		isLoading: () => isLoading,
		loadingPoints: () => loadingPoints ?? LOADING_POINTS
	});

	/** Category key pushed up by the rendered `<PolarAngleAxis dataKey>`. */
	let registeredAngleKey = $state<string | undefined>(undefined);
	let registeredAngleToken: string | null = null;

	const seriesKeys = $derived(Object.keys(config));
	const chartData = $derived((isLoading ? loading.loadingData : data) as Record<string, unknown>[]);

	/** Category key for the angle scale. Falls back the same way the cartesian charts do (A-1). */
	const fallbackAngleKey = $derived(
		Object.keys(chartData[0] ?? {}).find(
			(key) => !seriesKeys.includes(key) && key !== LOADING_RADAR_DATA_KEY
		)
	);
	const angleKey = $derived(registeredAngleKey ?? fallbackAngleKey);

	const series = $derived(
		isLoading
			? [{ key: LOADING_RADAR_DATA_KEY, value: LOADING_RADAR_DATA_KEY }]
			: seriesKeys.map((key) => ({ key, value: key }))
	);

	const radarContext = setRadarChartContext({
		config: () => config,
		data: () => chartData,
		seriesKeys: () => (isLoading ? [LOADING_RADAR_DATA_KEY] : seriesKeys),
		angleKey: () => angleKey,
		isLoading: () => isLoading,
		introStartedAt: () => introStartedAt,
		renderStyle: () => renderStyle,
		ditherVariant: () => ditherVariant,
		selectedDataKey: () => selectedDataKey,
		selectDataKey: (next) => {
			selectedDataKey = next;
			onSelectionChange?.(next);
		},
		registerAngleDataKey: (token, key) => {
			// Ignore a stale teardown from LayerChart's mount-time remount (DEVIATIONS.md A-3).
			if (key === undefined && registeredAngleToken !== token) return;
			registeredAngleToken = key === undefined ? null : token;
			registeredAngleKey = key;
		}
	});

	const CHART_MARGIN = 5;
	// The outer legend layout already consumes half of Recharts' 32px band. Reserve the remaining
	// scale space here so the settled polygon geometry matches the reference.
	const EDGE_LEGEND_HEIGHT = 15;
	const edgeLegendPlacement = $derived.by(() => {
		if (isLoading) return null;
		const align = radarContext.slots.legend?.verticalAlign;
		return align === 'top' || align === 'bottom' ? align : null;
	});
	const padding = $derived({
		top: CHART_MARGIN + (edgeLegendPlacement === 'top' ? EDGE_LEGEND_HEIGHT : 0),
		right: CHART_MARGIN,
		bottom: CHART_MARGIN + (edgeLegendPlacement === 'bottom' ? EDGE_LEGEND_HEIGHT : 0),
		left: CHART_MARGIN
	});
</script>

<ChartContainer {config} {initialDimension} bind:dimension={chartDimension} class={className}>
	<LoadingIndicator {isLoading} />
	<LegendRender placement="top" />
	<!--
		`radial` maps the x scale onto [0, 2π] and the y scale onto a radius. The angle scale must be
		a *band* scale so `n` categories sit at `i · 2π / n` and the polygon closes — a point scale
		would put the last vertex back on the first. `bandPadding={0}` keeps each vertex on its own
		band edge, which is where LayerChart's radial line generator reads the angle from.

		Recharts reserves its 5px chart margin and an edge legend before computing the radius, then
		nices the value domain. The explicit padding and `yNice` below reproduce that settled layout.
	-->
	<!--
		The pointer handlers live on this wrapper so they see a move anywhere over the chart,
		including over a radar polygon.
	-->
	<div
		class="flex min-h-0 w-full flex-1 flex-col"
		onpointermove={isLoading ? undefined : showTooltip}
		onpointerleave={() => layerContext?.tooltip.hide()}
		role="presentation"
	>
		<Chart
			width={chartDimension.width}
			height={chartDimension.height}
			bind:context={layerContext}
			data={chartData}
			x={angleKey}
			{series}
			seriesLayout="overlap"
			radial
			bandPadding={0}
			yBaseline={0}
			yNice
			yRange={({ width, height }) => [
				0,
				(Math.min(width, height) / 2) * DEFAULT_OUTER_RADIUS_RATIO
			]}
			{padding}
			tooltipContext={{ mode: 'manual' }}
			class="h-full w-full"
			{...chartProps}
		>
			{#if renderStyle === 'dither'}
				<Html pointerEvents={false} clip zIndex={0}>
					<DitherDomLayer
						{ditherVariant}
						cellSize={ditherCellSize}
						{bloom}
						paused={isLoading}
						animationDuration={REVEAL_BEGIN + REVEAL_DURATION}
						animationRevision={introStartedAt}
					/>
				</Html>
			{/if}
			<Svg zIndex={1}>
				<Group center>
					{#if backgroundVariant}
						<ChartBackground variant={backgroundVariant} />
					{/if}
					{@render children()}
					{#if isLoading}
						<LoadingRadar />
					{/if}
				</Group>
			</Svg>
			<TooltipRender />
		</Chart>
	</div>
	<LegendRender placement="middle" />
	<LegendRender placement="bottom" />
</ChartContainer>
