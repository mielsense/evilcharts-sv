import Root from './radial-chart.svelte';
import RadialBar from './radial-bar.svelte';
import Tooltip from './tooltip.svelte';
import Legend from './legend.svelte';

type RootComponent = typeof Root;

// Compound API: every part hangs off the root as a static member, so a consumer
// writes <EvilRadialChart.RadialBar/>, <EvilRadialChart.Tooltip/>, … from a single
// import — no colliding named marker exports when several charts share one file.
//
// The explicit annotation is required for `svelte-package` to emit types; see
// plans/DEVIATIONS.md F-1.
export const EvilRadialChart: RootComponent & {
	RadialBar: typeof RadialBar;
	Tooltip: typeof Tooltip;
	Legend: typeof Legend;
} = Object.assign(Root, {
	RadialBar,
	Tooltip,
	Legend
});

export type { RadialVariant } from './types.js';
export type { ChartConfig } from '../../ui/layerchart-chart/index.js';
