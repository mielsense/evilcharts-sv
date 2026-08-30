<script lang="ts">
	/**
	 * Root of the composable sankey chart. Owns the flow data, the shared context, the layout
	 * configuration, and the loading skeleton. The visual parts — the nodes, links, and tooltip —
	 * are composed as children, so a consumer renders exactly the parts they need.
	 */
	import { Chart, Svg, type ChartState } from 'layerchart';
	import { untrack, type Snippet } from 'svelte';
	import {
		ChartContainer,
		LoadingIndicator,
		type ChartAccessibility,
		type ChartConfig
	} from '../../ui/layerchart-chart/index.js';
	import { ChartBackground, type BackgroundVariant } from '../../ui/layerchart-background/index.js';
	import NodeColorGradients from './defs/node-color-gradients.svelte';
	import { computeSankey, getNodeValue, SankeyValidationError, type SankeyData } from './layout.js';
	import LoadingSankey from './loading/loading-sankey.svelte';
	import SankeyLink from './sankey-link.svelte';
	import SankeyNode from './sankey-node.svelte';
	import { setSankeyChartContext } from './sankey-chart-context.svelte.js';
	import { setSankeySlotsContext } from './sankey-slots.svelte.js';
	import TooltipRender from './tooltip-render.svelte';
	import {
		CHART_MARGIN,
		DEFAULT_ITERATIONS,
		DEFAULT_LINK_CURVATURE,
		DEFAULT_NODE_PADDING,
		DEFAULT_NODE_WIDTH
	} from './types.js';

	let {
		data,
		config,
		children,
		class: className,
		accessibility,
		nodeWidth = DEFAULT_NODE_WIDTH,
		nodePadding = DEFAULT_NODE_PADDING,
		linkCurvature = DEFAULT_LINK_CURVATURE,
		iterations = DEFAULT_ITERATIONS,
		sort = true,
		align = 'justify',
		verticalAlign = 'justify',
		backgroundVariant,
		defaultSelectedNode = null,
		onSelectionChange,
		isLoading = false,
		sankeyProps,
		chartProps,
		initialDimension = { width: 320, height: 200 }
	}: {
		data: SankeyData; // nodes + links rendered by the chart
		config: ChartConfig; // node colors + labels keyed by node name
		children: Snippet; // composed parts — <Node />, <Link />, <Tooltip />, …
		class?: string; // extra classes for the chart container
		accessibility?: ChartAccessibility; // accessible name and description for the chart group
		nodeWidth?: number; // width of each node in pixels
		nodePadding?: number; // vertical gap between nodes in pixels
		linkCurvature?: number; // link curve amount, 0 (straight) to 1 (maximum)
		iterations?: number; // layout iterations — higher is more accurate
		sort?: boolean; // sorts nodes automatically for an optimal layout
		align?: 'left' | 'justify'; // horizontal node alignment strategy
		verticalAlign?: 'justify' | 'top'; // vertical node alignment strategy
		backgroundVariant?: BackgroundVariant; // background pattern behind the chart
		defaultSelectedNode?: string | null; // node selected on first render
		onSelectionChange?: (selection: { dataKey: string; value: number } | null) => void; // fires when the selected node changes
		isLoading?: boolean; // shows the animated loading skeleton
		sankeyProps?: Record<string, unknown>; // canonical escape hatch, matching the original API
		/** @deprecated Use `sankeyProps`. */
		chartProps?: Record<string, unknown>; // escape hatch for the raw LayerChart Chart
		initialDimension?: { width: number; height: number }; // zero-size/first-render fallback
	} = $props();

	const forwardedSankeyProps = $derived({ ...(chartProps ?? {}), ...(sankeyProps ?? {}) });

	const chartId = $props.id(); // selector-safe id keeps CSS/SVG references valid
	let chartDimension = $state(untrack(() => initialDimension));

	// One-time initialisation, mirroring the reference's `useState(defaultSelectedNode)`.
	let selectedNode = $state<string | null>(untrack(() => defaultSelectedNode));

	/** LayerChart's chart state, for the plot box and the tooltip. */
	let layerContext = $state<ChartState<Record<string, unknown>> | undefined>(undefined);

	const slots = setSankeySlotsContext();

	setSankeyChartContext({
		data: () => data,
		config: () => config,
		chartId: () => chartId,
		isLoading: () => isLoading,
		selectedNode: () => selectedNode,
		selectNode: (nodeName) => {
			selectedNode = nodeName;

			if (!onSelectionChange) return;
			if (nodeName === null) {
				onSelectionChange(null);
				return;
			}
			onSelectionChange({ dataKey: nodeName, value: getNodeValue(data, nodeName) });
		}
	});

	/**
	 * The laid-out diagram.
	 *
	 * Recharts runs its own sankey layout rather than d3-sankey, so it is ported in `layout.ts` and
	 * driven from here — that is what makes the node rectangles land on the reference's pixels.
	 */
	const laidOut = $derived.by(() => {
		try {
			return computeSankey({
				data,
				width: layerContext?.width ?? 0,
				height: layerContext?.height ?? 0,
				iterations,
				nodeWidth,
				nodePadding,
				linkCurvature,
				sort,
				align,
				verticalAlign,
				left: 0,
				top: 0
			});
		} catch (error) {
			if (error instanceof SankeyValidationError) return { nodes: [], links: [] };
			throw error;
		}
	});

	const nodeLabel = $derived(slots.nodeLabel);

	/** Shows the tooltip for a hovered node or link, as the reference's payload does. */
	function showNode(shape: (typeof laidOut.nodes)[number]) {
		return (event: PointerEvent) => {
			layerContext?.tooltip.show(event, {
				name: shape.payload.name,
				value: shape.payload.value,
				payload: shape.payload
			});
		};
	}

	function showLink(shape: (typeof laidOut.links)[number]) {
		return (event: PointerEvent) => {
			layerContext?.tooltip.show(event, {
				name: `${shape.payload.source.name} - ${shape.payload.target.name}`,
				value: shape.payload.value,
				payload: shape.payload
			});
		};
	}

	const hide = () => layerContext?.tooltip.hide();
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
	{#if isLoading}
		<LoadingSankey />
	{:else}
		<!--
			`padding` is Recharts' `<Sankey margin>` default, so `layerContext.width`/`.height` are the
			same plot box its layout measures against.
		-->
		<Chart
			width={chartDimension.width}
			height={chartDimension.height}
			bind:context={layerContext}
			data={data.nodes}
			padding={{
				top: CHART_MARGIN,
				right: CHART_MARGIN,
				bottom: CHART_MARGIN,
				left: CHART_MARGIN
			}}
			tooltipContext={{ mode: 'manual' }}
			class="h-full w-full"
			{...forwardedSankeyProps}
		>
			<Svg>
				{#if backgroundVariant}
					<ChartBackground variant={backgroundVariant} />
				{/if}
				<!-- Links first so the nodes sit on top, as in the reference's child order. -->
				{#each laidOut.links as shape (shape.index)}
					<SankeyLink {shape} linkConfig={slots.link} onhover={showLink(shape)} onleave={hide} />
				{/each}
				{#each laidOut.nodes as shape (shape.index)}
					<SankeyNode
						{shape}
						nodeConfig={slots.node}
						label={nodeLabel}
						onhover={showNode(shape)}
						onleave={hide}
					/>
				{/each}
				<defs>
					<NodeColorGradients {config} {chartId} />
				</defs>
			</Svg>
			<TooltipRender />
		</Chart>
	{/if}
	{@render children()}
</ChartContainer>
