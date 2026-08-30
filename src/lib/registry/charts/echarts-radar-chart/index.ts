import Root from './radar-chart.svelte';
import Radar from './radar.svelte';
import Dot from './dot.svelte';
import ActiveDot from './active-dot.svelte';
import PolarGrid from './polar-grid.svelte';
import PolarAngleAxis from './polar-angle-axis.svelte';
import PolarRadiusAxis from './polar-radius-axis.svelte';
import Legend from './legend.svelte';
import Tooltip from './tooltip.svelte';

type RootComponent = typeof Root;

export const EChartsRadarChart: RootComponent & {
	Radar: typeof Radar;
	Dot: typeof Dot;
	ActiveDot: typeof ActiveDot;
	PolarGrid: typeof PolarGrid;
	PolarAngleAxis: typeof PolarAngleAxis;
	PolarRadiusAxis: typeof PolarRadiusAxis;
	Tooltip: typeof Tooltip;
	Legend: typeof Legend;
} = Object.assign(Root, {
	Radar,
	Dot,
	ActiveDot,
	PolarGrid,
	PolarAngleAxis,
	PolarRadiusAxis,
	Tooltip,
	Legend
});

export type {
	ChartAccessibility,
	ChartConfig,
	EChartsRenderer
} from '../../ui/echarts-chart/index.js';
export type { DotVariant } from '../../ui/echarts-dot/index.js';
export type { DitherVariant, RenderStyle } from '../../ui/echarts-dither/index.js';
export type { LegendVariant } from '../../ui/echarts-legend/index.js';
export type {
	TooltipPosition,
	TooltipRoundness,
	TooltipVariant
} from '../../ui/echarts-tooltip/index.js';
export type { DitherBloom, GridType, RadarVariant } from './types.js';
