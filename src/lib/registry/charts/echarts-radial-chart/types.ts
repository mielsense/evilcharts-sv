import type { LegendVariant } from '../../ui/echarts-legend/index.js';
import type {
	TooltipPosition,
	TooltipRoundness,
	TooltipVariant
} from '../../ui/echarts-tooltip/index.js';

export type RadialVariant = 'full' | 'semi';
export type BackgroundVariant =
	| 'dots'
	| 'grid'
	| 'cross-hatch'
	| 'diagonal-lines'
	| 'plus'
	| 'falling-triangles'
	| '4-pointed-star'
	| 'tiny-checkers'
	| 'overlapping-circles'
	| 'wiggle-lines'
	| 'bubbles';

export type RadialSelection = { dataKey: string; value: number };

export type RadialBarRegistration = {
	dataKey: string;
	cornerRadius: number;
	barSize: number;
	showBackground: boolean;
	isClickable: boolean;
};

export type TooltipRegistration = {
	variant: TooltipVariant;
	roundness: TooltipRoundness;
	cursor?: boolean;
	defaultIndex?: number;
	position: TooltipPosition;
};

export type LegendRegistration = {
	variant: LegendVariant;
	align: 'left' | 'center' | 'right';
	verticalAlign: 'top' | 'middle' | 'bottom';
	isClickable: boolean;
};

export const DEFAULT_INNER_RADIUS = '30%';
export const DEFAULT_OUTER_RADIUS = '100%';
export const DEFAULT_CORNER_RADIUS = 5;
export const DEFAULT_BAR_SIZE = 14;
export const LOADING_BARS = 5;
export const LOADING_MAX = 100;
export const LOADING_ANIMATION_DURATION = 2000;
