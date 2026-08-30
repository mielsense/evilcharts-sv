import type { DotVariant } from '../../ui/echarts-dot/index.js';
import type { LegendVariant } from '../../ui/echarts-legend/index.js';
import type {
	TooltipPosition,
	TooltipRoundness,
	TooltipVariant
} from '../../ui/echarts-tooltip/index.js';

export const STROKE_WIDTH = 0.8;
export const LOADING_ANIMATION_DURATION = 2000;
export const REVEAL_DURATION = 1000;
export const BUFFER_DASH: [number, number] = [4, 3];

export type StrokeVariant = 'solid' | 'dashed' | 'animated-dashed';
export type LineAnimationType =
	| 'none'
	| 'left-to-right'
	| 'right-to-left'
	| 'center-out'
	| 'edges-in';
export type CurveType =
	| 'linear'
	| 'smooth'
	| 'bump'
	| 'monotone'
	| 'monotoneX'
	| 'monotoneY'
	| 'natural'
	| 'step';

export type LineRegistration = {
	dataKey: string;
	strokeVariant: StrokeVariant;
	strokeWidth: number;
	curveType?: CurveType;
	animationType?: LineAnimationType;
	connectNulls: boolean;
	isClickable: boolean;
	glowing: boolean;
	enableBufferLine: boolean;
	dotVariant: DotVariant;
	activeDotVariant: DotVariant;
};

export type AxisRegistration = {
	dataKey?: string;
	tickFormatter?: (value: string | number, index: number) => string;
	label?: string;
	hideDots: boolean;
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

export type BrushRegistration = {
	height?: number;
	formatLabel?: (value: string, index: number) => string;
	onChange?: (range: { startIndex: number; endIndex: number }) => void;
};

