import Root from './radar-chart.svelte';
import Radar from './radar.svelte';
import Dot from './dot.svelte';
import ActiveDot from './active-dot.svelte';
import PolarGrid from './polar-grid.svelte';
import PolarAngleAxis from './polar-angle-axis.svelte';
import PolarRadiusAxis from './polar-radius-axis.svelte';
import Tooltip from './tooltip.svelte';
import Legend from './legend.svelte';

type RootComponent = typeof Root;

// Compound API: every part hangs off the root as a static member, so a consumer
// writes <EvilRadarChart.Radar/>, <EvilRadarChart.Tooltip/>, … from a single import
// — no colliding named marker exports when several charts share one file.
//
// The explicit annotation is required for `svelte-package` to emit types.
export const EvilRadarChart: RootComponent & {
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

export type { RadarVariant } from './types.js';
export type { ChartAccessibility, ChartConfig } from '../../ui/layerchart-chart/index.js';
export type { DitherBloom, DitherVariant, RenderStyle } from '../../ui/layerchart-dither/index.js';
