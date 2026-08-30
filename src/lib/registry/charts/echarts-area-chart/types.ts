import type { DotVariant } from '../../ui/echarts-dot/index.js';
import type { DitherVariant } from '../../ui/echarts-dither/index.js';

export const STROKE_WIDTH = 0.8;
export const BUFFER_DASH: [number, number] = [4, 3];

export type AreaVariant =
	'gradient' | 'gradient-reverse' | 'solid' | 'dotted' | 'lines' | 'hatched' | 'none';
export type StrokeVariant = 'solid' | 'dashed' | 'animated-dashed';
export type StackType = 'default' | 'stacked' | 'expanded';
export type AreaAnimationType =
	'none' | 'left-to-right' | 'right-to-left' | 'center-out' | 'edges-in';
export type CurveType =
	'linear' | 'smooth' | 'bump' | 'monotone' | 'monotoneX' | 'monotoneY' | 'natural' | 'step';

export type AreaRegistration = {
	dataKey: string;
	variant: AreaVariant;
	strokeVariant: StrokeVariant;
	strokeWidth: number;
	curveType?: CurveType;
	animationType?: AreaAnimationType;
	connectNulls: boolean;
	isClickable: boolean;
	enableBufferLine: boolean;
	dotVariant: DotVariant;
	activeDotVariant: DotVariant;
	ditherVariant?: DitherVariant;
};

export type AxisRegistration = {
	dataKey?: string;
	tickFormatter?: (value: string | number, index: number) => string;
	label?: string;
	hideDots: boolean;
};

export type TooltipRegistration = {
	variant: import('../../ui/echarts-tooltip/index.js').TooltipVariant;
	roundness: import('../../ui/echarts-tooltip/index.js').TooltipRoundness;
	cursor?: boolean;
	defaultIndex?: number;
	position: import('../../ui/echarts-tooltip/index.js').TooltipPosition;
};

export type LegendRegistration = {
	variant: import('../../ui/echarts-legend/index.js').LegendVariant;
	align: 'left' | 'center' | 'right';
	verticalAlign: 'top' | 'middle' | 'bottom';
	isClickable: boolean;
};

export type BrushRegistration = {
	height?: number;
	formatLabel?: (value: string, index: number) => string;
	onChange?: (range: { startIndex: number; endIndex: number }) => void;
};
