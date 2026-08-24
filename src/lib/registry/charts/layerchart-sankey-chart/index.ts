import Root from './sankey-chart.svelte';
import Node from './node.svelte';
import NodeLabel from './node-label.svelte';
import Link from './link.svelte';
import Tooltip from './tooltip.svelte';

type RootComponent = typeof Root;

// Compound API: every part hangs off the root as a static member, so a consumer
// writes <EvilSankeyChart.Node/>, <EvilSankeyChart.Tooltip/>, … from a single import
// — no colliding named marker exports when several charts share one file.
//
// The explicit annotation is required for `svelte-package` to emit types.
export const EvilSankeyChart: RootComponent & {
	Node: typeof Node;
	NodeLabel: typeof NodeLabel;
	Link: typeof Link;
	Tooltip: typeof Tooltip;
} = Object.assign(Root, {
	Node,
	NodeLabel,
	Link,
	Tooltip
});

export type { LinkVariant, NodeLabelPosition } from './types.js';
export type { SankeyData } from './layout.js';
export type { ChartAccessibility, ChartConfig } from '../../ui/layerchart-chart/index.js';
