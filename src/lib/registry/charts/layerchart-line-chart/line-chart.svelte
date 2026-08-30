<script lang="ts" generics="TData extends Record<string, unknown>">
	/**
	 * Root of the composable line chart. Owns the data, the shared context, the
	 * loading skeleton, and the optional zoom brush. Everything visual — axes,
	 * grid, tooltip, legend, and the lines themselves — is composed as children,
	 * so a consumer renders exactly the parts they need.
	 */
	import { Chart, Html, Svg, type ChartState } from 'layerchart';
	import { scalePoint, type ScalePoint } from 'd3-scale';
	import { untrack, type Snippet } from 'svelte';
	import {
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
	import LegendRender from './legend-render.svelte';
	import { setLineChartContext } from './line-chart-context.svelte.js';
	import {
		DitherDomLayer,
		type DitherBloom,
		type DitherVariant,
		type RenderStyle
	} from '../../ui/layerchart-dither/index.js';
	import LoadingLine from './loading/loading-line.svelte';
	import { LoadingDataState } from './loading/use-loading-data.svelte.js';
	import TooltipCursor from './tooltip-cursor.svelte';
	import TooltipRender from './tooltip-render.svelte';
	import {
		LOADING_LINE_DATA_KEY,
		REVEAL_DURATION,
		type CurveType,
		type LineAnimationType
	} from './types.js';
	import { SvelteMap, SvelteSet } from 'svelte/reactivity';

	let {
		config,
		data,
		children,
		class: className,
		chartProps,
		accessibility,
		curveType = 'linear',
		animationType = 'left-to-right',
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
		children: Snippet; // composed parts — <Line />, <XAxis />, <Legend />, …
		class?: string; // extra classes for the chart container
		chartProps?: Record<string, unknown>; // escape hatch for the raw LayerChart Chart
		accessibility?: ChartAccessibility; // accessible name and description for the chart group
		curveType?: CurveType; // default curve interpolation for every <Line />
		animationType?: LineAnimationType; // default intro reveal for every <Line />
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
	let chartDimension = $state(untrack(() => initialDimension));
	let layerContext = $state<ChartState<Record<string, unknown>, ScalePoint<string>> | undefined>(
		undefined
	);
	const intro = createIntroTimeline({
		durationMs: () => REVEAL_DURATION * 1000,
		isLoading: () => isLoading
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

	/** Category key pushed up by the rendered `<XAxis dataKey>`, when there is one. */
	let registeredXKey = $state<string | undefined>(undefined);
	let registeredXKeyToken: string | null = null;

	/**
	 * Which axes are rendered, so the plot area reserves the same space Recharts does.
	 */
	// `SvelteSet`, not a plain `Set` in `$state`: `$state` proxies objects and arrays but not
	// `Map`/`Set`, so `.add()` / `.delete()` would not notify and the padding would never
	// pick up an axis.
	const axesPresent = { x: new SvelteSet<string>(), y: new SvelteMap<string, number>() };
	const renderedSeries = new SvelteMap<symbol, { dataKey: string; isClickable: boolean }>();

	const CHART_MARGIN = 5; // Recharts' default <LineChart margin>
	const X_AXIS_HEIGHT = 30; // Recharts' default <XAxis height>
	const EDGE_LEGEND_HEIGHT = 32;
	let lineContext = $state<ReturnType<typeof setLineChartContext>>();
	const edgeLegendPlacement = $derived.by(() => {
		if (isLoading || !lineContext) return null;
		const align = lineContext.slots.legend?.verticalAlign;
		return align === 'top' || align === 'bottom' ? align : null;
	});

	const padding = $derived({
		top: CHART_MARGIN + (edgeLegendPlacement === 'top' ? EDGE_LEGEND_HEIGHT : 0),
		right: CHART_MARGIN,
		bottom:
			CHART_MARGIN +
			(!isLoading && axesPresent.x.size > 0 ? X_AXIS_HEIGHT : 0) +
			(edgeLegendPlacement === 'bottom' ? EDGE_LEGEND_HEIGHT : 0),
		left: CHART_MARGIN + (isLoading ? 0 : Math.max(0, ...axesPresent.y.values()))
	});

	// Recharts derives its value domain, legend payload, and tooltip payload from the rendered
	// `<Line />` children. Config only supplies presentation metadata; extra config entries must not
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

	/** Category key for the x scale, resolved from the mounted axis before falling back to data. */
	const fallbackXKey = $derived(
		Object.keys(chartData[0] ?? {}).find(
			(key) => !seriesKeys.includes(key) && !(key in config) && key !== LOADING_LINE_DATA_KEY
		)
	);
	const xKey = $derived(
		isLoading ? LOADING_CATEGORY_DATA_KEY : (xDataKey ?? registeredXKey ?? fallbackXKey)
	);

	const series = $derived(
		isLoading
			? [{ key: LOADING_LINE_DATA_KEY, value: LOADING_LINE_DATA_KEY }]
			: seriesKeys.map((key) => ({ key, value: key }))
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

	lineContext = setLineChartContext({
		config: () => config,
		data: () => chartData,
		xKey: () => xKey,
		seriesKeys: () => seriesKeys,
		curveType: () => curveType,
		animationType: () => animationType,
		introElapsed: () => intro.elapsed,
		startIntro: intro.start,
		renderStyle: () => renderStyle,
		ditherVariant: () => ditherVariant,
		isLoading: () => isLoading,
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
		seriesLayout="overlap"
		xScale={scalePoint()}
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
					animationRevision={intro.revision}
				/>
			</Html>
		{/if}
		<Svg zIndex={1}>
			{@render children()}
			<TooltipCursor />
			{#if isLoading}
				<LoadingLine {chartId} {curveType} onShimmerExit={loading.onShimmerExit} />
			{/if}
		</Svg>
		<TooltipRender />
	</Chart>
	<LegendRender placement="middle" />
	<LegendRender placement="bottom" />
	{#if !lineContext?.slots.legend?.isClickable}
		<SelectableSeriesControls
			items={selectableSeries}
			selectedKey={selectedDataKey}
			onToggle={(key) => lineContext?.selectDataKey(selectedDataKey === key ? null : key)}
		/>
	{/if}

	{#snippet footer()}
		{#if showBrush && !isLoading}
			<EvilBrush
				data={data as Record<string, unknown>[]}
				chartConfig={config}
				{xDataKey}
				variant="line"
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
