import type { DotVariant } from '../../ui/echarts-dot/index.js';
import type { DitherBloom } from '../../ui/echarts-dither/index.js';
import type { LegendVariant } from '../../ui/echarts-legend/index.js';
import type {
	TooltipPosition,
	TooltipRoundness,
	TooltipVariant
} from '../../ui/echarts-tooltip/index.js';

export const STROKE_WIDTH = 1;
export const DEFAULT_FILL_OPACITY = 0.3;
export const REVEAL_DURATION = 1000;
export const LOADING_ANIMATION_DURATION = 2000;
export const LOADING_DEFAULT_POINTS = 6;
export const LOADING_MAX = 100;

export type RadarVariant = 'filled' | 'lines';
export type GridType = 'polygon' | 'circle';
export type { DitherBloom };

export type RadarRegistration = {
	dataKey: string;
	variant: RadarVariant;
	fillOpacity: number;
	isClickable: boolean;
	dotVariant: DotVariant;
	activeDotVariant: DotVariant;
};

export type GridRegistration = { gridType: GridType };
export type AngleAxisRegistration = { dataKey?: string };

export type TooltipRegistration = {
	variant: TooltipVariant;
	roundness: TooltipRoundness;
	defaultIndex?: number;
	position: TooltipPosition;
};

export type LegendRegistration = {
	variant: LegendVariant;
	align: 'left' | 'center' | 'right';
	verticalAlign: 'top' | 'middle' | 'bottom';
	isClickable: boolean;
};
