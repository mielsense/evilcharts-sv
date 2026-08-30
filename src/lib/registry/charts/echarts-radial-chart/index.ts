import Root from './radial-chart.svelte';
import RadialBar from './radial-bar.svelte';
import { Tooltip } from '../../ui/echarts-tooltip/index.js';
import Legend from './legend.svelte';

type RootComponent = typeof Root;
export const EChartsRadialChart: RootComponent & {
	RadialBar: typeof RadialBar;
	Tooltip: typeof Tooltip;
	Legend: typeof Legend;
} = Object.assign(Root, { RadialBar, Tooltip, Legend });

export type {
	ChartAccessibility,
	ChartConfig,
	EChartsRenderer
} from '../../ui/echarts-chart/index.js';
export type { LegendVariant } from '../../ui/echarts-legend/index.js';
export type {
	TooltipPosition,
	TooltipRoundness,
	TooltipVariant
} from '../../ui/echarts-tooltip/index.js';
export type { BackgroundVariant, RadialSelection, RadialVariant } from './types.js';
