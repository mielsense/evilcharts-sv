import Root from './pie-chart.svelte';
import Pie from './pie.svelte';
import Label from './label.svelte';
import Tooltip from './tooltip.svelte';
import Legend from './legend.svelte';
import Background from './background.svelte';

type RootComponent = typeof Root;

// Compound API: every part hangs off the root as a static member, so a consumer
// writes <EvilPieChart.Pie/>, <EvilPieChart.Tooltip/>, … from a single import
// — no colliding named marker exports when several charts share one file.
//
// The explicit annotation is required for `svelte-package` to emit types; see
// plans/DEVIATIONS.md F-1.
export const EvilPieChart: RootComponent & {
	Pie: typeof Pie;
	Label: typeof Label;
	Tooltip: typeof Tooltip;
	Legend: typeof Legend;
	Background: typeof Background;
} = Object.assign(Root, {
	Pie,
	Label,
	Tooltip,
	Legend,
	Background
});

export type { PieVariant } from './types.js';
export type { ChartConfig } from '../../ui/layerchart-chart/index.js';
export type { DitherBloom, DitherVariant, RenderStyle } from '../../ui/layerchart-dither/index.js';
