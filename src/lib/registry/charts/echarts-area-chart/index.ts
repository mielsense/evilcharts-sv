import Root from './area-chart.svelte';
import Area from './area.svelte';
import Dot from './dot.svelte';
import ActiveDot from './active-dot.svelte';
import XAxis from './x-axis.svelte';
import YAxis from './y-axis.svelte';
import Grid from './grid.svelte';
import { Tooltip } from '../../ui/echarts-tooltip/index.js';
import { Legend } from '../../ui/echarts-legend/index.js';
import { Brush } from '../../ui/echarts-brush/index.js';

type RootComponent = typeof Root;
export const EChartsAreaChart: RootComponent & {
	Area: typeof Area;
	Dot: typeof Dot;
	ActiveDot: typeof ActiveDot;
	XAxis: typeof XAxis;
	YAxis: typeof YAxis;
	Grid: typeof Grid;
	Tooltip: typeof Tooltip;
	Legend: typeof Legend;
	Brush: typeof Brush;
} = Object.assign(Root, { Area, Dot, ActiveDot, XAxis, YAxis, Grid, Tooltip, Legend, Brush });

export type {
	ChartAccessibility,
	ChartConfig,
	EChartsRenderer,
	EChartsRenderStyle
} from '../../ui/echarts-chart/index.js';
export type { DitherBloom, DitherVariant, RenderStyle } from '../../ui/echarts-dither/index.js';
export type { DotVariant } from '../../ui/echarts-dot/index.js';
export type { LegendVariant } from '../../ui/echarts-legend/index.js';
export type {
	TooltipPosition,
	TooltipRoundness,
	TooltipVariant
} from '../../ui/echarts-tooltip/index.js';
export type {
	AreaAnimationType,
	AreaVariant,
	CurveType,
	StackType,
	StrokeVariant
} from './types.js';
