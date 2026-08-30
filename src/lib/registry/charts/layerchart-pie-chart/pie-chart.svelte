<script lang="ts" generics="TData extends Record<string, unknown>">
	/**
	 * Root of the composable pie chart. Owns the data, the shared context, and the loading
	 * skeleton. Everything visual — the pie itself, tooltip, legend, and an optional background —
	 * is composed as children, so a consumer renders exactly the parts they need.
	 */
	import { Chart, Group, Html, Svg } from 'layerchart';
	import { untrack, type Snippet } from 'svelte';
	import {
		ChartContainer,
		LoadingIndicator,
		type ChartAccessibility,
		type ChartConfig
	} from '../../ui/layerchart-chart/index.js';
	import LegendRender from './legend-render.svelte';
	import { setPieChartContext } from './pie-chart-context.svelte.js';
	import {
		DitherDomLayer,
		type DitherBloom,
		type DitherVariant,
		type RenderStyle
	} from '../../ui/layerchart-dither/index.js';
	import TooltipRender from './tooltip-render.svelte';
	import { ANIMATION_BEGIN, ANIMATION_DURATION } from './types.js';

	let {
		config,
		data,
		dataKey,
		nameKey,
		children,
		class: className,
		chartProps,
		accessibility,
		defaultSelectedSector = null,
		selectedSector: selectedSectorProp,
		onSelectionChange,
		isLoading = false,
		initialDimension = { width: 320, height: 200 },
		renderStyle = 'svg',
		ditherVariant = 'gradient',
		ditherCellSize = 2,
		bloom = 'off'
	}: {
		config: ChartConfig; // sector colors + labels
		data: TData[]; // rows rendered by the chart
		dataKey: keyof TData & string; // key holding each sector's numeric value
		nameKey: keyof TData & string; // key holding each sector's name
		children: Snippet; // composed parts — <Pie />, <Tooltip />, <Legend />, …
		class?: string; // extra classes for the chart container
		chartProps?: Record<string, unknown>; // escape hatch for the raw LayerChart Chart
		accessibility?: ChartAccessibility; // accessible name and description for the chart group
		defaultSelectedSector?: string | null; // sector selected on first render
		selectedSector?: string | null; // controlled selected sector; null clears selection
		onSelectionChange?: (selection: { dataKey: string; value: number } | null) => void; // fires when the selected sector changes
		isLoading?: boolean; // shows the animated loading skeleton
		initialDimension?: { width: number; height: number }; // zero-size/first-render fallback
		renderStyle?: RenderStyle;
		ditherVariant?: DitherVariant;
		ditherCellSize?: number;
		bloom?: DitherBloom;
	} = $props();

	// One-time initialisation, mirroring the reference's `useState(defaultSelectedSector)`.
	let internalSelectedSector = $state<string | null>(untrack(() => defaultSelectedSector));
	const selectedSector = $derived(
		selectedSectorProp === undefined ? internalSelectedSector : selectedSectorProp
	);
	let chartDimension = $state(untrack(() => initialDimension));
	let introStartedAt = $state(Date.now());
	let previousLoading = untrack(() => isLoading);

	$effect(() => {
		const loadingNow = isLoading;
		if (previousLoading && !loadingNow) introStartedAt = Date.now();
		previousLoading = loadingNow;
	});

	const rows = $derived(data as Record<string, unknown>[]);

	/** Recharts' default `<PieChart margin>`, which is what its maximum radius measures against. */
	const CHART_MARGIN = 5;
	const EDGE_LEGEND_HEIGHT = 32;
	// An empty Recharts legend wrapper still reserves 24px while the loading pie is visible.
	const LOADING_EDGE_LEGEND_HEIGHT = 24;
	let pieContext: ReturnType<typeof setPieChartContext>;
	const edgeLegendPlacement = $derived.by(() => {
		if (!pieContext) return null;
		const align = pieContext.slots.legend?.verticalAlign;
		return align === 'top' || align === 'bottom' ? align : null;
	});
	const edgeLegendHeight = $derived(isLoading ? LOADING_EDGE_LEGEND_HEIGHT : EDGE_LEGEND_HEIGHT);
	const padding = $derived({
		top: CHART_MARGIN + (edgeLegendPlacement === 'top' ? edgeLegendHeight : 0),
		right: CHART_MARGIN,
		bottom: CHART_MARGIN + (edgeLegendPlacement === 'bottom' ? edgeLegendHeight : 0),
		left: CHART_MARGIN
	});

	pieContext = setPieChartContext({
		config: () => config,
		data: () => rows,
		dataKey: () => dataKey,
		nameKey: () => nameKey,
		isLoading: () => isLoading,
		introStartedAt: () => introStartedAt,
		renderStyle: () => renderStyle,
		ditherVariant: () => ditherVariant,
		selectedSector: () => selectedSector,
		selectSector: (sectorName) => {
			if (selectedSectorProp === undefined) internalSelectedSector = sectorName;

			if (sectorName === null) {
				onSelectionChange?.(null);
				return;
			}

			const selectedItem = rows.find((item) => item[nameKey] === sectorName);

			if (selectedItem) {
				onSelectionChange?.({ dataKey: sectorName, value: selectedItem[dataKey] as number });
			}
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
		data={rows}
		x={dataKey}
		{padding}
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
					animationDuration={ANIMATION_BEGIN + ANIMATION_DURATION}
					animationRevision={introStartedAt}
				/>
			</Html>
		{/if}
		<Svg zIndex={1}>
			<!--
				The pie is centred in the plot box, which is how Recharts places it: `cx`/`cy` both
				default to `"50%"`, and the sectors' radii are measured from there.
			-->
			<Group center>
				{@render children()}
			</Group>
		</Svg>
		<TooltipRender />
	</Chart>
	<LegendRender placement="middle" />
	<LegendRender placement="bottom" />
</ChartContainer>
