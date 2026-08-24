import Root from './bar-chart.svelte';
import Bar from './bar.svelte';
import XAxis from './x-axis.svelte';
import YAxis from './y-axis.svelte';
import Grid from './grid.svelte';
import Tooltip from './tooltip.svelte';
import Legend from './legend.svelte';
import { Brush } from '../../ui/layerchart-brush/index.js';

type RootComponent = typeof Root;

// Compound API: every part hangs off the root as a static member, so a consumer
// writes <EvilBarChart.Bar/>, <EvilBarChart.Tooltip/>, … from a single import
// — no colliding named marker exports when several charts share one file.
//
// The explicit annotation is required for `svelte-package` to emit types; see
// plans/DEVIATIONS.md F-1.
export const EvilBarChart: RootComponent & {
	Bar: typeof Bar;
	XAxis: typeof XAxis;
	YAxis: typeof YAxis;
	Grid: typeof Grid;
	Tooltip: typeof Tooltip;
	Legend: typeof Legend;
	Brush: typeof Brush;
} = Object.assign(Root, { Bar, XAxis, YAxis, Grid, Tooltip, Legend, Brush });

export type { BarAnimationType, BarLayout, BarVariant, StackType } from './types.js';
export type { ChartConfig } from '../../ui/layerchart-chart/index.js';
export type { DitherBloom, DitherVariant, RenderStyle } from '../../ui/layerchart-dither/index.js';
