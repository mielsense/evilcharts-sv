<script lang="ts" generics="TData extends Record<string, unknown>">
	/**
	 * Root of the composable area chart. Owns the data, the shared context, the
	 * loading skeleton, and the optional zoom brush. Everything visual — axes,
	 * grid, tooltip, legend, and the areas themselves — is composed as children,
	 * so a consumer renders exactly the parts they need.
	 */
	import { Chart, Html, Svg, type ChartState } from 'layerchart';
	import { scalePoint, type ScalePoint } from 'd3-scale';
	import { untrack, type Snippet } from 'svelte';
	import {
		ChartContainer,
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
	import { setAreaChartContext } from './area-chart-context.svelte.js';
	import {
		DitherDomLayer,
		type DitherBloom,
		type DitherVariant,
		type RenderStyle
	} from '../../ui/layerchart-dither/index.js';
	import LegendRender from './legend-render.svelte';
	import TooltipCursor from './tooltip-cursor.svelte';
	import TooltipRender from './tooltip-render.svelte';
	import LoadingArea from './loading/loading-area.svelte';
	import { LoadingDataState } from './loading/use-loading-data.svelte.js';
	import { SvelteMap, SvelteSet } from 'svelte/reactivity';
	import {
		LOADING_AREA_DATA_KEY,
		type AreaAnimationType,
		type CurveType,
		type StackType
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
		stackType = 'default',
		defaultSelectedDataKey = null,
		onSelectionChange,
		isLoading = false,
		loadingPoints,
		xDataKey,
		initialDimension = { width: 320, height: 200 },
		renderStyle = 'svg',
		ditherVariant = 'gradient',
		ditherCellSize = 2,
		bloom = 'off'
	}: {
		config: ChartConfig; // series colors + labels
		data: TData[]; // rows rendered by the chart
		children: Snippet; // composed parts — <Area />, <XAxis />, <Legend />, …
		class?: string; // extra classes for the chart container
		chartProps?: Record<string, unknown>; // escape hatch for the raw LayerChart Chart
		accessibility?: ChartAccessibility; // accessible name and description for the chart group
		curveType?: CurveType; // default curve interpolation for every <Area />
		animationType?: AreaAnimationType; // default intro reveal for every <Area />
		stackType?: StackType; // how multiple areas combine
		defaultSelectedDataKey?: string | null; // series selected on first render
		onSelectionChange?: (selectedDataKey: string | null) => void; // fires when the selected series changes
		isLoading?: boolean; // shows the animated loading skeleton
		loadingPoints?: number; // number of points in the loading skeleton
		xDataKey?: keyof TData & string; // x-axis key — also used by the <Brush /> footer
		initialDimension?: { width: number; height: number }; // zero-size/first-render fallback
		renderStyle?: RenderStyle;
		ditherVariant?: DitherVariant;
		ditherCellSize?: number;
		bloom?: DitherBloom;
	} = $props();

	const chartId = $props.id(); // selector-safe id keeps CSS/SVG references valid
	const categoryScale = scalePoint();
	let introStartedAt = $state(Date.now());
	let chartDimension = $state(untrack(() => initialDimension));
	let previousLoading = untrack(() => isLoading);
	let layerContext = $state<ChartState<Record<string, unknown>, ScalePoint<string>> | undefined>(
		undefined
	);

	$effect(() => {
		const loadingNow = isLoading;
		if (previousLoading && !loadingNow) introStartedAt = Date.now();
		previousLoading = loadingNow;
	});

	// One-time initialisation, mirroring the reference's `useState(defaultSelectedDataKey)`.
	let selectedDataKey = $state<string | null>(untrack(() => defaultSelectedDataKey));

	const loading = new LoadingDataState({
		isLoading: () => isLoading,
		loadingPoints: () => loadingPoints ?? 14
	});

	const brush = new EvilBrushState({ data: () => data as Record<string, unknown>[] });

	// The <Brush> child is config-only: its presence turns the footer on. The reference pulls it
	// out of `children`; Svelte registers it into this context instead.
	const brushSlot = setBrushSlotContext();
	const showBrush = $derived(brushSlot.present);

	const isExpanded = $derived(stackType === 'expanded');
	const isStacked = $derived(stackType === 'stacked' || isExpanded);

	/** Category key pushed up by the rendered `<XAxis dataKey>`, when there is one. */
	let registeredXKey = $state<string | undefined>(undefined);
	let registeredXKeyToken: string | null = null;

	/**
	 * Which axes are rendered, so the plot area reserves the same space Recharts does.
	 *
	 * Recharts' `<AreaChart>` defaults to a 5px margin on every side and lets each axis claim a
	 * band inside it — 30px high for an `<XAxis>`, 60px wide for a `<YAxis>`. LayerChart wants one
	 * explicit `padding`, so it is derived from these two flags.
	 */
	// `SvelteSet`, not a plain `Set` in `$state`: `$state` proxies objects and arrays but not
	// `Map`/`Set`, so `.add()` / `.delete()` would not notify and the padding would never
	// pick up an axis.
	const axesPresent = { x: new SvelteSet<string>(), y: new SvelteMap<string, number>() };
	const renderedSeries = new SvelteMap<symbol, { dataKey: string; isClickable: boolean }>();

	const CHART_MARGIN = 5; // Recharts' default <AreaChart margin>
	const X_AXIS_HEIGHT = 30; // Recharts' default <XAxis height>
	// Recharts expands an implicit positive value domain by 5% above its maximum. Its hidden
	// loading axis still applies that domain, so the skeleton starts below the chart margin while
	// its zero baseline remains on the bottom margin.
	const loadingDomainHeadroom = $derived(
		Math.round(Math.max(0, chartDimension.height - CHART_MARGIN * 2) * 0.05)
	);
	// Recharts reserves a 32px edge-legend band before resolving the value scale.
	const EDGE_LEGEND_HEIGHT = 32;
	let areaContext = $state<ReturnType<typeof setAreaChartContext>>();
	const edgeLegendPlacement = $derived.by(() => {
		if (isLoading || !areaContext) return null;
		const align = areaContext.slots.legend?.verticalAlign;
		return align === 'top' || align === 'bottom' ? align : null;
	});

	const padding = $derived({
		top:
			CHART_MARGIN +
			(isLoading ? loadingDomainHeadroom : 0) +
			(edgeLegendPlacement === 'top' ? EDGE_LEGEND_HEIGHT : 0),
		right: CHART_MARGIN,
		bottom:
			CHART_MARGIN +
			(!isLoading && axesPresent.x.size > 0 ? X_AXIS_HEIGHT : 0) +
			(edgeLegendPlacement === 'bottom' ? EDGE_LEGEND_HEIGHT : 0),
		left: CHART_MARGIN + (isLoading ? 0 : Math.max(0, ...axesPresent.y.values()))
	});

	// Recharts derives its value domain, legend payload, and tooltip payload from the rendered
	// `<Area />` children. Config only supplies presentation metadata; extra config entries must not
	// create phantom marks or stretch the value scale.
	const seriesKeys = $derived([
		...new Set([...renderedSeries.values()].map((item) => item.dataKey))
	]);
	const selectableSeries = $derived(
		[
			...new Set(
				[...renderedSeries.values()].filter((item) => item.isClickable).map((item) => item.dataKey)
			)
		].map((key) => ({
			key,
			label: typeof config[key]?.label === 'string' ? config[key].label : key
		}))
	);
	const displayData = $derived(showBrush && !isLoading ? brush.visibleData : data);
	const chartData = $derived(
		(isLoading ? loading.loadingData : displayData) as Record<string, unknown>[]
	);

	/**
	 * Category key for the x scale.
	 *
	 * Recharts takes it from `<XAxis dataKey>` and needs nothing on the root. LayerChart needs it
	 * before children render, so it is resolved in three steps: the explicit `xDataKey` prop, the
	 * key the rendered `<XAxis />` registered, and finally the first row key that is neither a
	 * rendered series nor chart presentation metadata. The third step resolves synchronously on the
	 * first render, so there is never a frame with the wrong scale.
	 */
	const fallbackXKey = $derived(
		Object.keys(chartData[0] ?? {}).find(
			(key) => !seriesKeys.includes(key) && !(key in config) && key !== LOADING_AREA_DATA_KEY
		)
	);
	const xKey = $derived(
		isLoading ? LOADING_CATEGORY_DATA_KEY : (xDataKey ?? registeredXKey ?? fallbackXKey)
	);

	const series = $derived(
		isLoading
			? [{ key: LOADING_AREA_DATA_KEY, value: LOADING_AREA_DATA_KEY }]
			: seriesKeys.map((key) => ({ key, value: key }))
	);

	const seriesLayout = $derived(
		isExpanded ? ('stackExpand' as const) : isStacked ? ('stack' as const) : ('overlap' as const)
	);

	/** Resolve the nearest category exactly like Recharts, keeping the left row on a midpoint tie. */
	function showCategoryTooltip(event: PointerEvent) {
		if (isLoading || !layerContext || chartData.length === 0) return;

		const box = (event.currentTarget as HTMLElement).getBoundingClientRect();
		const x = event.clientX - box.left;
		const y = event.clientY - box.top;
		const start = padding.left;
		const end = box.width - padding.right;
		const top = padding.top;
		const bottom = box.height - padding.bottom;
		if (x < start || x > end || y < top || y > bottom) {
			layerContext.tooltip.hide();
			return;
		}

		const step = chartData.length > 1 ? (end - start) / (chartData.length - 1) : 0;
		let nearest = 0;
		let nearestDistance = Number.POSITIVE_INFINITY;
		for (let index = 0; index < chartData.length; index += 1) {
			const distance = Math.abs(x - (start + index * step));
			if (distance < nearestDistance - Number.EPSILON) {
				nearest = index;
				nearestDistance = distance;
			}
		}

		layerContext.tooltip.show(event, chartData[nearest]);
	}

	areaContext = setAreaChartContext({
		config: () => config,
		data: () => chartData,
		xKey: () => xKey,
		seriesKeys: () => seriesKeys,
		curveType: () => curveType,
		animationType: () => animationType,
		introStartedAt: () => introStartedAt,
		renderStyle: () => renderStyle,
		ditherVariant: () => ditherVariant,
		isStacked: () => isStacked,
		isExpanded: () => isExpanded,
		isLoading: () => isLoading,
		chartHeight: () => chartDimension.height,
		plotTop: () => padding.top,
		xAxisLeadingInset: () => padding.left,
		xAxisTrailingInset: () => padding.right,
		chartId: () => chartId,
		selectedDataKey: () => selectedDataKey,
		selectDataKey: (next) => {
			selectedDataKey = next;
			onSelectionChange?.(next);
		},
		registerXAxisDataKey: (token, key) => {
			// Ignore a stale teardown from LayerChart's mount-time remount.
			if (key === undefined && registeredXKeyToken !== token) return;
			registeredXKeyToken = key === undefined ? null : token;
			registeredXKey = key;
		},
		registerSeries: (token, key, isClickable, present) => {
			if (present) renderedSeries.set(token, { dataKey: key, isClickable });
			else renderedSeries.delete(token);
		},
		registerAxis: (token, axis, present, size) => {
			if (axis === 'x') {
				if (present) axesPresent.x.add(token);
				else axesPresent.x.delete(token);
			} else if (present) axesPresent.y.set(token, size ?? 42);
			else axesPresent.y.delete(token);
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
	<Chart
		width={chartDimension.width}
		height={chartDimension.height}
		data={chartData}
		x={xKey}
		{series}
		{seriesLayout}
		xScale={categoryScale}
		xPadding={[0, 0]}
		yBaseline={0}
		yNice
		{padding}
		bind:context={layerContext}
		tooltipContext={{ mode: 'manual' }}
		{...chartProps}
		onpointermove={showCategoryTooltip}
		onpointerleave={() => layerContext?.tooltip.hide()}
		class="h-full w-full"
	>
		{#if renderStyle === 'dither'}
			<Html pointerEvents={false} clip zIndex={0}>
				<DitherDomLayer
					{ditherVariant}
					cellSize={ditherCellSize}
					{bloom}
					paused={isLoading}
					animationDuration={1000}
					animationRevision={introStartedAt}
				/>
			</Html>
		{/if}
		<Svg zIndex={1}>
			{@render children()}
			<TooltipCursor />
			{#if isLoading}
				<LoadingArea {chartId} {curveType} onShimmerExit={loading.onShimmerExit} />
			{/if}
		</Svg>
		<TooltipRender />
	</Chart>
	<LegendRender placement="middle" />
	<LegendRender placement="bottom" />
	{#if !areaContext?.slots.legend?.isClickable}
		<SelectableSeriesControls
			items={selectableSeries}
			selectedKey={selectedDataKey}
			onToggle={(key) => areaContext?.selectDataKey(selectedDataKey === key ? null : key)}
		/>
	{/if}

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
