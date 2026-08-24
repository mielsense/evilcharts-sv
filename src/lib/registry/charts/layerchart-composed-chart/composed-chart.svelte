<script lang="ts" generics="TData extends Record<string, unknown>">
	/**
	 * Root of the composable composed chart. Owns the data, the shared context, the
	 * loading skeleton, and the optional zoom brush. Everything visual — axes, grid,
	 * tooltip, legend, and the bars and lines themselves — is composed as children,
	 * so a consumer renders exactly the parts they need.
	 */
	import { Chart, Html, Svg } from 'layerchart';
	import { untrack, type Snippet } from 'svelte';
	import {
		ChartContainer,
		LoadingIndicator,
		type ChartAccessibility,
		type ChartConfig
	} from '../../ui/layerchart-chart/index.js';
	import {
		EvilBrush,
		EvilBrushState,
		setBrushSlotContext
	} from '../../ui/layerchart-brush/index.js';
	import { setComposedChartContext } from './composed-chart-context.svelte.js';
	import {
		DitherDomLayer,
		type DitherBloom,
		type DitherVariant,
		type RenderStyle
	} from '../../ui/layerchart-dither/index.js';
	import LegendRender from './legend-render.svelte';
	import LoadingBar from './loading/loading-bar.svelte';
	import { LoadingDataState } from './loading/use-loading-data.svelte.js';
	import TooltipCursor from './tooltip-cursor.svelte';
	import TooltipRender from './tooltip-render.svelte';
	import { SvelteMap, SvelteSet } from 'svelte/reactivity';
	import {
		DEFAULT_BAR_RADIUS,
		LOADING_DATA_KEY,
		type ComposedAnimationType,
		type CurveType
	} from './types.js';

	let {
		config,
		data,
		children,
		class: className,
		chartProps,
		accessibility,
		curveType = 'linear',
		animationType = 'left-to-right',
		barGap,
		barCategoryGap,
		defaultSelectedDataKey = null,
		onSelectionChange,
		isLoading = false,
		loadingBars,
		xDataKey,
		initialDimension = { width: 320, height: 200 },
		renderStyle = 'svg',
		ditherVariant = 'gradient',
		ditherCellSize = 2,
		bloom = 'off'
	}: {
		config: ChartConfig; // series colors + labels for bars and lines
		data: TData[]; // rows rendered by the chart
		children: Snippet; // composed parts — <Bar />, <Line />, <XAxis />, <Legend />, …
		class?: string; // extra classes for the chart container
		chartProps?: Record<string, unknown>; // escape hatch for the raw LayerChart Chart
		accessibility?: ChartAccessibility; // accessible name and description for the chart group
		curveType?: CurveType; // default curve interpolation for every <Line />
		animationType?: ComposedAnimationType; // default intro for every <Bar /> and <Line />
		barGap?: number; // gap between bars sharing a category
		barCategoryGap?: number; // gap between bar categories
		defaultSelectedDataKey?: string | null; // series selected on first render
		onSelectionChange?: (selectedDataKey: string | null) => void; // fires when the selected series changes
		isLoading?: boolean; // shows the animated loading skeleton
		loadingBars?: number; // number of bars in the loading skeleton
		xDataKey?: keyof TData & string; // x-axis key — also used by the <Brush /> footer
		initialDimension?: { width: number; height: number }; // zero-size/first-render fallback
		renderStyle?: RenderStyle;
		ditherVariant?: DitherVariant;
		ditherCellSize?: number;
		bloom?: DitherBloom;
	} = $props();

	const chartId = $props.id(); // selector-safe id keeps CSS/SVG references valid

	/**
	 * Anchors the intro to a fixed moment so it plays exactly once — re-renders read elapsed
	 * time from here instead of replaying.
	 */
	let introStartedAt = $state(Date.now());
	let chartDimension = $state(untrack(() => initialDimension));
	let previousLoading = untrack(() => isLoading);

	$effect(() => {
		const loadingNow = isLoading;
		if (previousLoading && !loadingNow) introStartedAt = Date.now();
		previousLoading = loadingNow;
	});

	// One-time initialisation, mirroring the reference's `useState(defaultSelectedDataKey)`.
	let selectedDataKey = $state<string | null>(untrack(() => defaultSelectedDataKey));
	let hoveredIndex = $state<number | null>(null);

	const loading = new LoadingDataState({
		isLoading: () => isLoading,
		loadingBars: () => loadingBars ?? 12
	});

	const brush = new EvilBrushState({ data: () => data as Record<string, unknown>[] });

	// The <Brush> child is config-only: its presence turns the footer on. The reference pulls it
	// out of `children`; Svelte registers it into this context instead.
	const brushSlot = setBrushSlotContext();
	const showBrush = $derived(brushSlot.present);

	/** Category key pushed up by the rendered `<XAxis dataKey>`, when there is one. */
	let registeredXKey = $state<string | undefined>(undefined);
	let registeredXKeyToken: string | null = null;

	/** Data keys of the rendered `<Bar />` children, so several bars can split a category. */
	// `SvelteMap` for the same reactive mutation behavior as `axesPresent` below.
	const barKeyByToken = new SvelteMap<string, string>();
	const barKeys = $derived([...barKeyByToken.values()]);
	/** Every rendered Bar/Line in actual child order; config entries are presentation metadata. */
	const seriesKeyByToken = new SvelteMap<string, string>();
	const seriesKeys = $derived([...seriesKeyByToken.values()]);

	/** Which axes are rendered, so the plot reserves the space Recharts does. */
	// `SvelteSet`, not a plain `Set` in `$state`: `$state` proxies objects and arrays but not
	// `Map`/`Set`, so `.add()` / `.delete()` would not notify and the padding would never
	// pick up an axis.
	const axesPresent = { x: new SvelteSet<string>(), y: new SvelteSet<string>() };

	const CHART_MARGIN = 5; // Recharts' default <ComposedChart margin>
	const X_AXIS_HEIGHT = 30; // Recharts' default <XAxis height>
	const Y_AXIS_WIDTH = 60; // Recharts' default <YAxis width>
	const EDGE_LEGEND_HEIGHT = 32; // Recharts' absolute edge-legend wrapper height
	let composedContext: ReturnType<typeof setComposedChartContext>;
	const edgeLegendPlacement = $derived.by(() => {
		if (isLoading || !composedContext) return null;
		const align = composedContext.slots.legend?.verticalAlign;
		return align === 'top' || align === 'bottom' ? align : null;
	});

	const padding = $derived({
		top: CHART_MARGIN + (edgeLegendPlacement === 'top' ? EDGE_LEGEND_HEIGHT : 0),
		right: CHART_MARGIN,
		bottom:
			CHART_MARGIN +
			(axesPresent.x.size > 0 ? X_AXIS_HEIGHT : 0) +
			(edgeLegendPlacement === 'bottom' ? EDGE_LEGEND_HEIGHT : 0),
		left: CHART_MARGIN + (axesPresent.y.size > 0 ? Y_AXIS_WIDTH : 0)
	});

	const configuredKeys = $derived(Object.keys(config));
	const displayData = $derived(showBrush && !isLoading ? brush.visibleData : data);
	const chartData = $derived(
		(isLoading ? loading.loadingData : displayData) as Record<string, unknown>[]
	);

	/** Category key for the band scale, resolved from the mounted axis before falling back to data. */
	const fallbackXKey = $derived(
		Object.keys(chartData[0] ?? {}).find(
			(key) => !configuredKeys.includes(key) && key !== LOADING_DATA_KEY
		)
	);
	const xKey = $derived(xDataKey ?? registeredXKey ?? fallbackXKey);

	const series = $derived(
		isLoading
			? [{ key: LOADING_DATA_KEY, value: LOADING_DATA_KEY }]
			: seriesKeys.map((key) => ({ key, value: key }))
	);
	const ditherAnimationDuration = $derived(
		Math.max(1000, 500 + Math.max(0, chartData.length - 1) * 50)
	);

	composedContext = setComposedChartContext({
		config: () => config,
		data: () => chartData,
		xKey: () => xKey,
		seriesKeys: () => seriesKeys,
		barKeys: () => barKeys,
		curveType: () => curveType,
		animationType: () => animationType,
		barGap: () => barGap,
		barCategoryGap: () => barCategoryGap,
		introStartedAt: () => introStartedAt,
		renderStyle: () => renderStyle,
		ditherVariant: () => ditherVariant,
		isLoading: () => isLoading,
		hoveredIndex: () => hoveredIndex,
		chartId: () => chartId,
		selectedDataKey: () => selectedDataKey,
		selectDataKey: (next) => {
			selectedDataKey = next;
			onSelectionChange?.(next);
		},
		registerBar: (token, key) => {
			if (key === undefined) barKeyByToken.delete(token);
			else barKeyByToken.set(token, key);
		},
		registerSeries: (token, key) => {
			if (key === undefined) seriesKeyByToken.delete(token);
			else seriesKeyByToken.set(token, key);
		},
		registerXAxisDataKey: (token, key) => {
			// Ignore a stale teardown from LayerChart's mount-time remount.
			if (key === undefined && registeredXKeyToken !== token) return;
			registeredXKeyToken = key === undefined ? null : token;
			registeredXKey = key;
		},
		registerAxis: (token, axis, present) => {
			if (present) axesPresent[axis].add(token);
			else axesPresent[axis].delete(token);
		}
	});
</script>

<ChartContainer
	{config}
	{initialDimension}
	{accessibility}
	bind:dimension={chartDimension}
	class={className}
>
	<LoadingIndicator {isLoading} />
	<LegendRender placement="top" />
	<!-- The reference clears the hovered column when the pointer leaves the chart. -->
	<div
		class="flex min-h-0 w-full flex-1 flex-col"
		onpointerleave={() => (hoveredIndex = null)}
		role="presentation"
	>
		<Chart
			width={chartDimension.width}
			height={chartDimension.height}
			data={chartData}
			x={xKey}
			{series}
			seriesLayout="overlap"
			bandPadding={0}
			yBaseline={0}
			yNice
			{padding}
			tooltipContext={{ mode: 'band' }}
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
						animationDuration={ditherAnimationDuration}
						animationRevision={introStartedAt}
					/>
				</Html>
			{/if}
			<Svg>
				{@render children()}
				<TooltipCursor />
				{#if isLoading}
					<LoadingBar
						{chartId}
						barRadius={DEFAULT_BAR_RADIUS}
						onShimmerExit={loading.onShimmerExit}
					/>
				{/if}
			</Svg>
			<TooltipRender />
		</Chart>
	</div>
	<LegendRender placement="middle" />
	<LegendRender placement="bottom" />

	{#snippet footer()}
		{#if showBrush && !isLoading}
			<EvilBrush
				data={data as Record<string, unknown>[]}
				chartConfig={config}
				{xDataKey}
				variant="area"
				{curveType}
				height={brushSlot.slot?.height}
				formatLabel={brushSlot.slot?.formatLabel}
				skipStyle
				class="mt-1"
				startIndex={brush.brushProps.startIndex}
				endIndex={brush.brushProps.endIndex}
				onChange={(range) => {
					brush.brushProps.onChange(range);
					brushSlot.slot?.onChange?.(range);
				}}
			/>
		{/if}
	{/snippet}
</ChartContainer>
