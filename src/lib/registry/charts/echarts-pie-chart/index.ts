import Root from './pie-chart.svelte';
import Pie from './pie.svelte';
import Label from './label.svelte';
import Background from './background.svelte';
import Legend from './legend.svelte';
import Tooltip from './tooltip.svelte';

type RootComponent = typeof Root;

export const EChartsPieChart: RootComponent & {
	Pie: typeof Pie;
	Label: typeof Label;
	Tooltip: typeof Tooltip;
	Legend: typeof Legend;
	Background: typeof Background;
} = Object.assign(Root, { Pie, Label, Tooltip, Legend, Background });

export type {
	ChartAccessibility,
	ChartConfig,
	EChartsRenderer
} from '../../ui/echarts-chart/index.js';
export type { LegendVariant } from '../../ui/echarts-legend/index.js';
export type { DitherVariant, RenderStyle } from '../../ui/echarts-dither/index.js';
export type {
	TooltipPosition,
	TooltipRoundness,
	TooltipVariant
} from '../../ui/echarts-tooltip/index.js';
export type { BackgroundVariant, DitherBloom, LabelPosition, PieVariant } from './types.js';
