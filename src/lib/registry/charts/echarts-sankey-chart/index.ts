import Root from './sankey-chart.svelte';
import Node from './node.svelte';
import NodeLabel from './node-label.svelte';
import Link from './link.svelte';
import { Tooltip } from '../../ui/echarts-tooltip/index.js';

type RootComponent = typeof Root;
export const EChartsSankeyChart: RootComponent & {
	Node: typeof Node;
	NodeLabel: typeof NodeLabel;
	Link: typeof Link;
	Tooltip: typeof Tooltip;
} = Object.assign(Root, { Node, NodeLabel, Link, Tooltip });

export type {
	ChartAccessibility,
	ChartConfig,
	EChartsRenderer
} from '../../ui/echarts-chart/index.js';
export type {
	TooltipPosition,
	TooltipRoundness,
	TooltipVariant
} from '../../ui/echarts-tooltip/index.js';
export type {
	LinkVariant,
	NodeLabelPosition,
	SankeyAnimationType,
	SankeyData,
	SankeyLink,
	SankeyNode,
	SankeySelection
} from './types.js';
