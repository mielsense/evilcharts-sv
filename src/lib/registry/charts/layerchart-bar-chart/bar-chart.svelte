<script lang="ts" generics="TData extends Record<string, unknown>">
	/**
	 * Root of the composable bar chart. Owns the data, the shared context, the
	 * loading skeleton, and the optional zoom brush. Everything visual — axes,
	 * grid, tooltip, legend, and the bars themselves — is composed as children,
	 * so a consumer renders exactly the parts they need.
	 */
	import { Chart, Html, Svg, type ChartState } from 'layerchart';
	import { untrack, type Snippet } from 'svelte';
	import {
		barIntroDurationMs,
		ChartContainer,
		createIntroTimeline,
		LOADING_CATEGORY_DATA_KEY,
		LoadingIndicator,
		SelectableSeriesControls,
		type ChartAccessibility,
		type ChartConfig
	} from '../../ui/layerchart-chart/index.js';
	import {
		EvilBrush,
		EvilBrushState,
		setBrushSlotContext
	} from '../../ui/layerchart-brush/index.js';
	import { ChartBackground, type BackgroundVariant } from '../../ui/layerchart-background/index.js';
	import { setBarChartContext } from './bar-chart-context.svelte.js';
	import {
		DitherDomLayer,
		type DitherBloom,
		type DitherVariant,
		type RenderStyle
	} from '../../ui/layerchart-dither/index.js';
	import LegendRender from './legend-render.svelte';
	import LoadingBar from './loading/loading-bar.svelte';
	import { LoadingDataState } from './loading/use-loading-data.svelte.js';
	import TooltipRender from './tooltip-render.svelte';
	import { SvelteMap, SvelteSet } from 'svelte/reactivity';
	import {
		BAR_GROW_DURATION,
		BAR_STAGGER,
		DEFAULT_BAR_RADIUS,
		LOADING_BAR_DATA_KEY,
		type BarAnimationType,
		type BarLayout,
		type StackType
	} from './types.js';

	let {
		config,
		data,
		children,
		class: className,
		chartProps,
		accessibility,
		stackType = 'default',
		layout = 'vertical',
		barRadius = DEFAULT_BAR_RADIUS,
		animationType = 'left-to-right',
		barGap,
		barCategoryGap,
		backgroundVariant,
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
		config: ChartConfig; // series colors + labels
		data: TData[]; // rows rendered by the chart
		children: Snippet; // composed parts — <Bar />, <XAxis />, <Legend />, …
		class?: string; // extra classes for the chart container
		chartProps?: Record<string, unknown>; // escape hatch for the raw LayerChart Chart
		accessibility?: ChartAccessibility; // accessible name and description for the chart group
		stackType?: StackType; // how multiple bars combine
		layout?: BarLayout; // orientation of the bars
		barRadius?: number; // default corner radius for every <Bar />
		animationType?: BarAnimationType; // default grow-in order for every <Bar />
		barGap?: number; // gap between bars within the same category
		barCategoryGap?: number; // gap between categories of bars
		backgroundVariant?: BackgroundVariant; // background pattern drawn behind the chart
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
	let chartDimension = $state(untrack(() => initialDimension));
	const intro = createIntroTimeline({
		durationMs: () => barIntroDurationMs(chartData.length, BAR_GROW_DURATION, BAR_STAGGER),
		isLoading: () => isLoading
	});

	// One-time initialisation, mirroring the reference's `useState(defaultSelectedDataKey)`.
	let selectedDataKey = $state<string | null>(untrack(() => defaultSelectedDataKey));
	let isMouseInChart = $state(false);

	/** LayerChart's chart state, read for the row the pointer is currently over. */
	let layerContext = $state<ChartState<Record<string, unknown>> | undefined>(undefined);

	const loading = new LoadingDataState({
		isLoading: () => isLoading,
		loadingBars: () => loadingBars ?? 12
	});

	const brush = new EvilBrushState({ data: () => data as Record<string, unknown>[] });

	// The <Brush> child is config-only: its presence turns the footer on. The reference pulls it
	// out of `children`; Svelte registers it into this context instead.
	const brushSlot = setBrushSlotContext();
	const showBrush = $derived(brushSlot.present);

	const isPercent = $derived(stackType === 'percent');
	const isStacked = $derived(stackType === 'stacked' || isPercent);
	const isHorizontal = $derived(layout === 'horizontal');

	/** Category key pushed up by the rendered `<XAxis dataKey>`, when there is one. */
	let registeredXKey = $state<string | undefined>(undefined);
	let registeredXKeyToken: string | null = null;

	/** Data keys of the rendered `<Bar />` children, so a category can be divided between them. */
	// `SvelteMap` for the same reactive mutation behavior as `axesPresent` below.
	const barKeyByToken = new SvelteMap<string, { dataKey: string; isClickable: boolean }>();
	const barKeys = $derived([...barKeyByToken.values()].map((item) => item.dataKey));
	const selectableSeries = $derived(
		[
			...new Set(
				[...barKeyByToken.values()].filter((item) => item.isClickable).map((item) => item.dataKey)
			)
		].map((key) => ({
			key,
			label: typeof config[key]?.label === 'string' ? config[key].label : key
		}))
	);

	/** Which axes are rendered, so the plot reserves the space Recharts does. */
	// `SvelteSet`, not a plain `Set` in `$state`: `$state` proxies objects and arrays but not
	// `Map`/`Set`, so `.add()` / `.delete()` would not notify and the padding would never
	// pick up an axis.
	const axesPresent = { x: new SvelteSet<string>(), y: new SvelteSet<string>() };

	const CHART_MARGIN = 5; // Recharts' default <BarChart margin>
	const X_AXIS_HEIGHT = 30; // Recharts' default <XAxis height>
	const Y_AXIS_WIDTH = 60; // Recharts' default <YAxis width>

	// Recharts reserves the legend wrapper's full 32px height inside the chart surface.
	const EDGE_LEGEND_HEIGHT = 32;
	let barContext = $state<ReturnType<typeof setBarChartContext>>();
	const edgeLegendPlacement = $derived.by(() => {
		if (isLoading || !barContext) return null;
		const align = barContext.slots.legend?.verticalAlign;
		return align === 'top' || align === 'bottom' ? align : null;
	});

	const padding = $derived({
		top: CHART_MARGIN + (edgeLegendPlacement === 'top' ? EDGE_LEGEND_HEIGHT : 0),
		right: CHART_MARGIN,
		bottom:
			CHART_MARGIN +
			(!isLoading && axesPresent.x.size > 0 ? X_AXIS_HEIGHT : 0) +
			(edgeLegendPlacement === 'bottom' ? EDGE_LEGEND_HEIGHT : 0),
		left: CHART_MARGIN + (!isLoading && axesPresent.y.size > 0 ? Y_AXIS_WIDTH : 0)
	});

	const configuredKeys = $derived(Object.keys(config));
	// Recharts derives domains, legends and tooltips from rendered graphical children. Config is
	// only presentation metadata, so unused config entries must never become phantom series.
	const seriesKeys = $derived(barKeys);
	const displayData = $derived(showBrush && !isLoading ? brush.visibleData : data);
	const chartData = $derived(
		(isLoading ? loading.loadingData : displayData) as Record<string, unknown>[]
	);
	const ditherAnimationDuration = $derived(
		barIntroDurationMs(chartData.length, BAR_GROW_DURATION, BAR_STAGGER)
	);

	/** Category key for the band scale, resolved from the mounted axis before falling back to data. */
	const fallbackXKey = $derived(
		Object.keys(chartData[0] ?? {}).find(
			(key) => !configuredKeys.includes(key) && key !== LOADING_BAR_DATA_KEY
		)
	);
	const xKey = $derived(
		isLoading ? LOADING_CATEGORY_DATA_KEY : (xDataKey ?? registeredXKey ?? fallbackXKey)
	);

	const series = $derived(
		isLoading
			? [{ key: LOADING_BAR_DATA_KEY, value: LOADING_BAR_DATA_KEY }]
			: seriesKeys.map((key) => ({ key, value: key }))
	);

	// The baseline and `nice` rounding belong to the value axis, which the layout picks.
	/**
	 * Grouped bars are positioned by `getBarPositions` rather than by a nested band scale, so the
	 * series only ever `overlap` here.
	 */
	const seriesLayout = $derived(
		isPercent ? ('stackExpand' as const) : isStacked ? ('stack' as const) : ('overlap' as const)
	);

	barContext = setBarChartContext({
		config: () => config,
		data: () => chartData,
		xKey: () => xKey,
		seriesKeys: () => seriesKeys,
		barKeys: () => barKeys,
		animationType: () => animationType,
		isStacked: () => isStacked,
		isPercent: () => isPercent,
		isHorizontal: () => isHorizontal,
		barRadius: () => barRadius,
		barGap: () => barGap,
		barCategoryGap: () => barCategoryGap,
		introElapsed: () => intro.elapsed,
		startIntro: intro.start,
		renderStyle: () => renderStyle,
		ditherVariant: () => ditherVariant,
		isMouseInChart: () => isMouseInChart,
		activeRow: () => layerContext?.tooltip?.data as Record<string, unknown> | undefined,
		isLoading: () => isLoading,
		chartId: () => chartId,
		selectedDataKey: () => selectedDataKey,
		selectDataKey: (next) => {
			selectedDataKey = next;
			onSelectionChange?.(next);
		},
		registerBar: (token, key, isClickable) => {
			if (key === undefined) barKeyByToken.delete(token);
			else barKeyByToken.set(token, { dataKey: key, isClickable });
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
	aria-busy={isLoading}
	class={className}
>
	<LoadingIndicator {isLoading} />
	<LegendRender placement="top" />
	<!-- The reference tracks pointer enter/leave on the chart to drive the hover highlight. -->
	<div
		class="flex min-h-0 w-full flex-1 flex-col"
		onpointerenter={() => (isMouseInChart = true)}
		onpointerleave={() => (isMouseInChart = false)}
		role="presentation"
	>
		<Chart
			width={chartDimension.width}
			height={chartDimension.height}
			bind:context={layerContext}
			data={chartData}
			x={isHorizontal ? undefined : xKey}
			y={isHorizontal ? xKey : undefined}
			valueAxis={isHorizontal ? 'x' : 'y'}
			{series}
			{seriesLayout}
			bandPadding={0}
			xBaseline={isHorizontal ? 0 : undefined}
			yBaseline={isHorizontal ? undefined : 0}
			xNice={isHorizontal}
			yNice={!isHorizontal}
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
						animationRevision={intro.revision}
					/>
				</Html>
			{/if}
			<Svg>
				{#if backgroundVariant}
					<ChartBackground variant={backgroundVariant} />
				{/if}
				{@render children()}
				{#if isLoading}
					<LoadingBar {chartId} onShimmerExit={loading.onShimmerExit} />
				{/if}
			</Svg>
			<TooltipRender />
		</Chart>
	</div>
	<LegendRender placement="middle" />
	<LegendRender placement="bottom" />
	{#if !barContext?.slots.legend?.isClickable}
		<SelectableSeriesControls
			items={selectableSeries}
			selectedKey={selectedDataKey}
			onToggle={(key) => barContext?.selectDataKey(selectedDataKey === key ? null : key)}
		/>
	{/if}

	{#snippet footer()}
		{#if showBrush && !isLoading}
			<EvilBrush
				data={data as Record<string, unknown>[]}
				chartConfig={config}
				{xDataKey}
				variant="bar"
				{barRadius}
				height={brushSlot.slot?.height}
				formatLabel={brushSlot.slot?.formatLabel}
				stacked={isStacked}
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
