<script lang="ts" generics="TData extends Record<string, unknown>">
	/**
	 * Root of the composible pie chart. Owns the data, the shared context, and the loading
	 * skeleton. Everything visual — the pie itself, tooltip, legend, and an optional background —
	 * is composed as children, so a consumer renders exactly the parts they need.
	 */
	import { Chart, Group, Svg } from 'layerchart';
	import { untrack, type Snippet } from 'svelte';
	import {
		ChartContainer,
		LoadingIndicator,
		type ChartConfig
	} from '../../ui/layerchart-chart/index.js';
	import LegendRender from './legend-render.svelte';
	import { setPieChartContext } from './pie-chart-context.svelte.js';
	import TooltipRender from './tooltip-render.svelte';

	let {
		config,
		data,
		dataKey,
		nameKey,
		children,
		class: className,
		chartProps,
		defaultSelectedSector = null,
		onSelectionChange,
		isLoading = false
	}: {
		config: ChartConfig; // sector colors + labels
		data: TData[]; // rows rendered by the chart
		dataKey: keyof TData & string; // key holding each sector's numeric value
		nameKey: keyof TData & string; // key holding each sector's name
		children: Snippet; // composed parts — <Pie />, <Tooltip />, <Legend />, …
		class?: string; // extra classes for the chart container
		chartProps?: Record<string, unknown>; // escape hatch for the raw LayerChart Chart
		defaultSelectedSector?: string | null; // sector selected on first render
		onSelectionChange?: (selection: { dataKey: string; value: number } | null) => void; // fires when the selected sector changes
		isLoading?: boolean; // shows the animated loading skeleton
	} = $props();

	// One-time initialisation, mirroring the reference's `useState(defaultSelectedSector)`.
	let selectedSector = $state<string | null>(untrack(() => defaultSelectedSector));

	const rows = $derived(data as Record<string, unknown>[]);

	/** Recharts' default `<PieChart margin>`, which is what its maximum radius measures against. */
	const CHART_MARGIN = 5;
	const padding = {
		top: CHART_MARGIN,
		right: CHART_MARGIN,
		bottom: CHART_MARGIN,
		left: CHART_MARGIN
	};

	setPieChartContext({
		config: () => config,
		data: () => rows,
		dataKey: () => dataKey,
		nameKey: () => nameKey,
		isLoading: () => isLoading,
		selectedSector: () => selectedSector,
		selectSector: (sectorName) => {
			selectedSector = sectorName;

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

<ChartContainer {config} class={className}>
	<LoadingIndicator {isLoading} />
	<LegendRender placement="top" />
	<Chart data={rows} x={dataKey} {padding} class="h-full w-full" {...chartProps}>
		<Svg>
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
	<LegendRender placement="bottom" />
</ChartContainer>
