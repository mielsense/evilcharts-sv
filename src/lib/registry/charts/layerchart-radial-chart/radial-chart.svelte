<script lang="ts" generics="TData extends Record<string, unknown>">
	/**
	 * Root of the composible radial chart. Owns the data, the shared context, the loading skeleton,
	 * and the chart-wide arc shape. Everything visual — the tooltip, legend, and the radial bar
	 * itself — is composed as children, so a consumer renders exactly the parts they need.
	 */
	import { Chart, Group, Svg, type ChartState } from 'layerchart';
	import { untrack, type Snippet } from 'svelte';
	import {
		ChartContainer,
		LoadingIndicator,
		type ChartConfig
	} from '../../ui/layerchart-chart/index.js';
	import { ChartBackground, type BackgroundVariant } from '../../ui/layerchart-background/index.js';
	import ColorGradientStyle from './defs/color-gradient-style.svelte';
	import LegendRender from './legend-render.svelte';
	import LoadingRadialBar from './loading/loading-radial-bar.svelte';
	import { LoadingDataState } from './loading/use-loading-data.svelte.js';
	import { setRadialChartContext } from './radial-chart-context.svelte.js';
	import TooltipRender from './tooltip-render.svelte';
	import {
		CHART_MARGIN,
		DEFAULT_INNER_RADIUS,
		DEFAULT_OUTER_RADIUS,
		getVariantConfig,
		type RadialVariant
	} from './types.js';

	let {
		config,
		data,
		nameKey,
		children,
		class: className,
		chartProps,
		variant = 'full',
		max,
		innerRadius = DEFAULT_INNER_RADIUS,
		outerRadius = DEFAULT_OUTER_RADIUS,
		defaultSelectedDataKey = null,
		onSelectionChange,
		isLoading = false,
		backgroundVariant,
		initialDimension = { width: 320, height: 200 }
	}: {
		config: ChartConfig; // bar colors + labels
		data: TData[]; // rows rendered by the chart
		nameKey: keyof TData & string; // data key holding each bar's name
		children: Snippet; // composed parts — <RadialBar />, <Tooltip />, <Legend />
		class?: string; // extra classes for the chart container
		chartProps?: Record<string, unknown>; // escape hatch for the raw LayerChart Chart
		variant?: RadialVariant; // arc shape — full circle or half circle
		/**
		 * Value a full sweep represents. Without it the scale is derived from the data, so the
		 * largest bar always fills the arc — set it (e.g. 100) for gauges, where a single value has
		 * to read against a fixed total.
		 */
		max?: number;
		innerRadius?: number | string; // inner radius of the radial bars
		outerRadius?: number | string; // outer radius of the radial bars
		defaultSelectedDataKey?: string | null; // bar selected on first render
		onSelectionChange?: (selection: { dataKey: string; value: number } | null) => void; // fires when the selected bar changes
		isLoading?: boolean; // shows the animated loading skeleton
		backgroundVariant?: BackgroundVariant; // background pattern behind the chart
		initialDimension?: { width: number; height: number }; // zero-size/first-render fallback
	} = $props();

	const chartId = $props.id(); // selector-safe id keeps CSS/SVG references valid
	let chartDimension = $state(untrack(() => initialDimension));

	// One-time initialisation, mirroring the reference's `useState(defaultSelectedDataKey)`.
	let selectedBar = $state<string | null>(untrack(() => defaultSelectedDataKey));

	/** Value key pushed up by the rendered `<RadialBar dataKey>`. */
	let registeredValueKey = $state<string | undefined>(undefined);
	let registeredValueToken: string | null = null;

	const loading = new LoadingDataState({ isLoading: () => isLoading });

	const rows = $derived((isLoading ? loading.loadingData : data) as Record<string, unknown>[]);
	const variantConfig = $derived(getVariantConfig(variant));

	/**
	 * LayerChart's chart state, read for the plot box the arc centre is placed against.
	 *
	 * `<Group x>` only takes a *number* as a pixel translate — handing it a function switches the
	 * group into data mode, which renders one group per row and applies no transform at all.
	 */
	let layerContext = $state<ChartState<Record<string, unknown>> | undefined>(undefined);
	const centre = $derived({
		x: (layerContext?.width ?? 0) * variantConfig.cx,
		y: (layerContext?.height ?? 0) * variantConfig.cy
	});

	const padding = {
		top: CHART_MARGIN,
		right: CHART_MARGIN,
		bottom: CHART_MARGIN,
		left: CHART_MARGIN
	};

	setRadialChartContext({
		config: () => config,
		data: () => rows,
		// The skeleton rows carry their own `name` key.
		nameKey: () => (isLoading ? 'name' : nameKey),
		valueKey: () => registeredValueKey,
		chartId: () => chartId,
		variant: () => variant,
		max: () => max,
		innerRadius: () => innerRadius,
		outerRadius: () => outerRadius,
		isLoading: () => isLoading,
		selectedBar: () => selectedBar,
		selectBar: (barName, value) => {
			selectedBar = barName;
			onSelectionChange?.(barName === null ? null : { dataKey: barName, value: value ?? 0 });
		},
		registerValueKey: (token, key) => {
			// Ignore a stale teardown from LayerChart's mount-time remount (DEVIATIONS.md A-3).
			if (key === undefined && registeredValueToken !== token) return;
			registeredValueToken = key === undefined ? null : token;
			registeredValueKey = key;
		}
	});
</script>

<ChartContainer {config} {initialDimension} bind:dimension={chartDimension} class={className}>
	<LoadingIndicator {isLoading} />
	<LegendRender placement="top" />
	<!--
		The arcs carry their own angles and radii, so the chart only has to supply the plot box.
		`padding` is Recharts' default `<RadialBarChart margin>`, which its maximum radius measures
		against.
	-->
	<Chart
		width={chartDimension.width}
		height={chartDimension.height}
		bind:context={layerContext}
		data={rows}
		{padding}
		class="h-full w-full"
		{...chartProps}
	>
		<Svg>
			<!--
				Recharts places the arc centre with `cx`/`cy`: the middle for `full`, and 70% down for
				`semi` so the half circle fills the box.
			-->
			<Group x={centre.x} y={centre.y}>
				{#if backgroundVariant}
					<ChartBackground variant={backgroundVariant} />
				{/if}
				{@render children()}
				{#if isLoading}
					<LoadingRadialBar />
				{/if}
			</Group>
			<defs>
				<ColorGradientStyle {config} {chartId} />
			</defs>
		</Svg>
		<TooltipRender />
	</Chart>
	<LegendRender placement="middle" />
	<LegendRender placement="bottom" />
</ChartContainer>
