<script lang="ts" generics="TData extends Record<string, unknown>">
	/**
	 * Root of the composible area chart. Owns the data, the shared context, the
	 * loading skeleton, and the optional zoom brush. Everything visual — axes,
	 * grid, tooltip, legend, and the areas themselves — is composed as children,
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
	import { setAreaChartContext } from './area-chart-context.svelte.js';
	import LegendRender from './legend-render.svelte';
	import TooltipCursor from './tooltip-cursor.svelte';
	import TooltipRender from './tooltip-render.svelte';
	import LoadingArea from './loading/loading-area.svelte';
	import { LoadingDataState } from './loading/use-loading-data.svelte.js';
	import { SvelteSet } from 'svelte/reactivity';
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
		curveType = 'linear',
		animationType = 'left-to-right',
		stackType = 'default',
		defaultSelectedDataKey = null,
		onSelectionChange,
		isLoading = false,
		loadingPoints,
		xDataKey
	}: {
		config: ChartConfig; // series colors + labels
		data: TData[]; // rows rendered by the chart
		children: Snippet; // composed parts — <Area />, <XAxis />, <Legend />, …
		class?: string; // extra classes for the chart container
		chartProps?: Record<string, unknown>; // escape hatch for the raw LayerChart Chart
		curveType?: CurveType; // default curve interpolation for every <Area />
		animationType?: AreaAnimationType; // default intro reveal for every <Area />
		stackType?: StackType; // how multiple areas combine
		defaultSelectedDataKey?: string | null; // series selected on first render
		onSelectionChange?: (selectedDataKey: string | null) => void; // fires when the selected series changes
		isLoading?: boolean; // shows the animated loading skeleton
		loadingPoints?: number; // number of points in the loading skeleton
		xDataKey?: keyof TData & string; // x-axis key — also used by the <Brush /> footer
	} = $props();

	const chartId = $props.id(); // selector-safe id keeps CSS/SVG references valid

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
	// pick up an axis. See plans/DEVIATIONS.md U-3.
	const axesPresent = { x: new SvelteSet<string>(), y: new SvelteSet<string>() };

	const CHART_MARGIN = 5; // Recharts' default <AreaChart margin>
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

	/**
	 * Category key for the x scale.
	 *
	 * Recharts takes it from `<XAxis dataKey>` and needs nothing on the root. LayerChart needs it
	 * before children render, so it is resolved in three steps: the explicit `xDataKey` prop, the
	 * key the rendered `<XAxis />` registered, and finally the first row key that is *not* a
	 * configured series — which is what Recharts effectively uses as the category. The third step
	 * resolves synchronously on the first render, so there is never a frame with the wrong scale.
	 * See plans/DEVIATIONS.md A-1.
	 */
	const fallbackXKey = $derived(
		Object.keys(chartData[0] ?? {}).find(
			(key) => !seriesKeys.includes(key) && key !== LOADING_AREA_DATA_KEY
		)
	);
	const xKey = $derived(xDataKey ?? registeredXKey ?? fallbackXKey);

	const series = $derived(
		isLoading
			? [{ key: LOADING_AREA_DATA_KEY, value: LOADING_AREA_DATA_KEY }]
			: seriesKeys.map((key) => ({ key, value: key }))
	);

	const seriesLayout = $derived(
		isExpanded ? ('stackExpand' as const) : isStacked ? ('stack' as const) : ('overlap' as const)
	);

	setAreaChartContext({
		config: () => config,
		data: () => chartData,
		xKey: () => xKey,
		seriesKeys: () => seriesKeys,
		curveType: () => curveType,
		animationType: () => animationType,
		isStacked: () => isStacked,
		isExpanded: () => isExpanded,
		isLoading: () => isLoading,
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

<ChartContainer {config} class={className}>
	<LoadingIndicator {isLoading} />
	<LegendRender placement="top" />
	<!-- The tooltip runs in `band` mode, not `bisect-x`: the category axis is an ordinal point
	     scale, and bisecting a domain of month names picks essentially at random. Band mode puts a
	     hit rect one step wide over each point, which is how Recharts activates a category.
	     See plans/DEVIATIONS.md A-9. -->
	<Chart
		data={chartData}
		x={xKey}
		{series}
		{seriesLayout}
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
				<LoadingArea {chartId} {curveType} onShimmerExit={loading.onShimmerExit} />
			{/if}
		</Svg>
		<TooltipRender />
	</Chart>
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
