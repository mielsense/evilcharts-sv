<script lang="ts" generics="TData extends Record<string, unknown>">
	/**
	 * Root of the composable line chart. Owns the data, the shared context, the
	 * loading skeleton, and the optional zoom brush. Everything visual — axes,
	 * grid, tooltip, legend, and the lines themselves — is composed as children,
	 * so a consumer renders exactly the parts they need.
	 */
	import { Chart, Svg } from 'layerchart';
	import { scalePoint } from 'd3-scale';
	import { untrack, type Snippet } from 'svelte';
	import {
		ChartContainer,
		LoadingIndicator,
		type ChartConfig
	} from '../../ui/layerchart-chart/index.js';
	import {
		EvilBrush,
		EvilBrushState,
		setBrushSlotContext
	} from '../../ui/layerchart-brush/index.js';
	import LegendRender from './legend-render.svelte';
	import { setLineChartContext } from './line-chart-context.svelte.js';
	import LoadingLine from './loading/loading-line.svelte';
	import { LoadingDataState } from './loading/use-loading-data.svelte.js';
	import TooltipCursor from './tooltip-cursor.svelte';
	import TooltipRender from './tooltip-render.svelte';
	import { LOADING_LINE_DATA_KEY, type CurveType, type LineAnimationType } from './types.js';
	import { SvelteSet } from 'svelte/reactivity';

	let {
		config,
		data,
		children,
		class: className,
		chartProps,
		curveType = 'linear',
		animationType = 'left-to-right',
		defaultSelectedDataKey = null,
		onSelectionChange,
		isLoading = false,
		loadingPoints,
		xDataKey,
		initialDimension = { width: 320, height: 200 }
	}: {
		config: ChartConfig; // series colors + labels
		data: TData[]; // rows rendered by the chart
		children: Snippet; // composed parts — <Line />, <XAxis />, <Legend />, …
		class?: string; // extra classes for the chart container
		chartProps?: Record<string, unknown>; // escape hatch for the raw LayerChart Chart
		curveType?: CurveType; // default curve interpolation for every <Line />
		animationType?: LineAnimationType; // default intro reveal for every <Line />
		defaultSelectedDataKey?: string | null; // series selected on first render
		onSelectionChange?: (selectedDataKey: string | null) => void; // fires when the selected series changes
		isLoading?: boolean; // shows the animated loading skeleton
		loadingPoints?: number; // number of points in the loading skeleton
		xDataKey?: keyof TData & string; // x-axis key — also used by the <Brush /> footer
		initialDimension?: { width: number; height: number }; // zero-size/first-render fallback
	} = $props();

	const chartId = $props.id(); // selector-safe id keeps CSS/SVG references valid
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

	const loading = new LoadingDataState({
		isLoading: () => isLoading,
		loadingPoints: () => loadingPoints ?? 14
	});

	const brush = new EvilBrushState({ data: () => data as Record<string, unknown>[] });

	// The <Brush> child is config-only: its presence turns the footer on. The reference pulls it
	// out of `children`; Svelte registers it into this context instead (SPEC §4.2).
	const brushSlot = setBrushSlotContext();
	const showBrush = $derived(brushSlot.present);

	/** Category key pushed up by the rendered `<XAxis dataKey>`, when there is one. */
	let registeredXKey = $state<string | undefined>(undefined);
	let registeredXKeyToken: string | null = null;

	/**
	 * Which axes are rendered, so the plot area reserves the same space Recharts does.
	 * See plans/DEVIATIONS.md A-7.
	 */
	// `SvelteSet`, not a plain `Set` in `$state`: `$state` proxies objects and arrays but not
	// `Map`/`Set`, so `.add()` / `.delete()` would not notify and the padding would never
	// pick up an axis. See plans/DEVIATIONS.md U-3.
	const axesPresent = { x: new SvelteSet<string>(), y: new SvelteSet<string>() };

	const CHART_MARGIN = 5; // Recharts' default <LineChart margin>
	const X_AXIS_HEIGHT = 30; // Recharts' default <XAxis height>
	const Y_AXIS_WIDTH = 60; // Recharts' default <YAxis width>

	const padding = $derived({
		top: CHART_MARGIN,
		right: CHART_MARGIN,
		bottom: CHART_MARGIN + (axesPresent.x.size > 0 ? X_AXIS_HEIGHT : 0),
		left: CHART_MARGIN + (axesPresent.y.size > 0 ? Y_AXIS_WIDTH : 0)
	});

	const seriesKeys = $derived(Object.keys(config));
	const displayData = $derived(showBrush && !isLoading ? brush.visibleData : data);
	const chartData = $derived(
		(isLoading ? loading.loadingData : displayData) as Record<string, unknown>[]
	);

	/** Category key for the x scale. See plans/DEVIATIONS.md A-1. */
	const fallbackXKey = $derived(
		Object.keys(chartData[0] ?? {}).find(
			(key) => !seriesKeys.includes(key) && key !== LOADING_LINE_DATA_KEY
		)
	);
	const xKey = $derived(xDataKey ?? registeredXKey ?? fallbackXKey);

	const series = $derived(
		isLoading
			? [{ key: LOADING_LINE_DATA_KEY, value: LOADING_LINE_DATA_KEY }]
			: seriesKeys.map((key) => ({ key, value: key }))
	);

	setLineChartContext({
		config: () => config,
		data: () => chartData,
		xKey: () => xKey,
		seriesKeys: () => seriesKeys,
		curveType: () => curveType,
		animationType: () => animationType,
		introStartedAt: () => introStartedAt,
		isLoading: () => isLoading,
		xAxisLeadingInset: () => padding.left,
		chartId: () => chartId,
		selectedDataKey: () => selectedDataKey,
		selectDataKey: (next) => {
			selectedDataKey = next;
			onSelectionChange?.(next);
		},
		registerXAxisDataKey: (token, key) => {
			// Ignore a stale teardown from LayerChart's mount-time remount (DEVIATIONS.md A-3).
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

<ChartContainer {config} {initialDimension} bind:dimension={chartDimension} class={className}>
	<LoadingIndicator {isLoading} />
	<LegendRender placement="top" />
	<!-- The tooltip runs in `band` mode, not `bisect-x`: the category axis is an ordinal point
	     scale, and bisecting a domain of month names picks essentially at random. Band mode puts a
	     hit rect one step wide over each point, which is how Recharts activates a category.
	     See plans/DEVIATIONS.md A-9. -->
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
		tooltipContext={{ mode: 'quadtree-x' }}
		class="h-full w-full"
		{...chartProps}
	>
		<Svg>
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
