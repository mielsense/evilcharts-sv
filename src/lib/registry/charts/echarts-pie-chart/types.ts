import type { LegendVariant } from '../../ui/echarts-legend/index.js';
import type { DitherBloom } from '../../ui/echarts-dither/index.js';
import type {
	TooltipPosition,
	TooltipRoundness,
	TooltipVariant
} from '../../ui/echarts-tooltip/index.js';

export const REVEAL_DURATION = 1000;
export const LOADING_ANIMATION_DURATION = 2000;
export const LOADING_SECTORS = 5;
export const DEFAULT_INNER_RADIUS: number | string = 0;
export const DEFAULT_OUTER_RADIUS: number | string = '80%';
export const DEFAULT_CORNER_RADIUS = 0;
export const DEFAULT_PADDING_ANGLE = 0;
export const DEFAULT_START_ANGLE = 0;
export const DEFAULT_END_ANGLE = 360;

export type PieVariant = 'gradient';
export type LabelPosition = 'inside' | 'outside';
export type { DitherBloom };
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

export type LabelRegistration = {
	dataKey?: string;
	position: LabelPosition;
};

export type PieRegistration = {
	variant: PieVariant;
	innerRadius: number | string;
	outerRadius: number | string;
	cornerRadius: number;
	paddingAngle: number;
	startAngle: number;
	endAngle: number;
	isClickable: boolean;
	labelDataKey: string | null;
	labelPosition: LabelPosition;
};

export type BackgroundRegistration = { variant: BackgroundVariant };

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
