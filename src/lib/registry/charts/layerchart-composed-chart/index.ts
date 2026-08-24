import Root from './composed-chart.svelte';
import Bar from './bar.svelte';
import Line from './line.svelte';
import Dot from './dot.svelte';
import ActiveDot from './active-dot.svelte';
import XAxis from './x-axis.svelte';
import YAxis from './y-axis.svelte';
import Grid from './grid.svelte';
import Tooltip from './tooltip.svelte';
import Legend from './legend.svelte';
import { Brush } from '../../ui/layerchart-brush/index.js';

type RootComponent = typeof Root;

// Compound API: every part hangs off the root as a static member, so a consumer
// writes <EvilComposedChart.Bar/>, <EvilComposedChart.Line/>, … from a single import
// — no colliding named marker exports when several charts share one file.
//
// The explicit annotation is required for `svelte-package` to emit types.
export const EvilComposedChart: RootComponent & {
	Bar: typeof Bar;
	Line: typeof Line;
	Dot: typeof Dot;
	ActiveDot: typeof ActiveDot;
	XAxis: typeof XAxis;
	YAxis: typeof YAxis;
	Grid: typeof Grid;
	Tooltip: typeof Tooltip;
	Legend: typeof Legend;
	Brush: typeof Brush;
} = Object.assign(Root, {
	Bar,
	Line,
	Dot,
	ActiveDot,
	XAxis,
	YAxis,
	Grid,
	Tooltip,
	Legend,
	Brush
});

export type { BarVariant, ComposedAnimationType, CurveType, StrokeVariant } from './types.js';
export type { ChartAccessibility, ChartConfig } from '../../ui/layerchart-chart/index.js';
export type { DitherBloom, DitherVariant, RenderStyle } from '../../ui/layerchart-dither/index.js';
