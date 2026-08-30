import type { BarSeriesOption, LineSeriesOption } from 'echarts/charts';
import type { DotVariant } from '../../ui/echarts-dot/index.js';
import type { DitherVariant } from '../../ui/echarts-dither/index.js';
export type BarVariant =
	'default' | 'hatched' | 'duotone' | 'duotone-reverse' | 'gradient' | 'stripped';
export type StrokeVariant = 'solid' | 'dashed' | 'animated-dashed';
export type ComposedAnimationType =
	'none' | 'left-to-right' | 'right-to-left' | 'center-out' | 'edges-in';
export type CurveType =
	'linear' | 'smooth' | 'bump' | 'monotone' | 'monotoneX' | 'monotoneY' | 'natural' | 'step';
export type BarRegistration = {
	dataKey: string;
	variant: BarVariant;
	radius: number;
	glow: boolean;
	animationType?: ComposedAnimationType;
	isClickable: boolean;
	enableHoverHighlight: boolean;
	barProps?: Partial<BarSeriesOption>;
	ditherVariant?: DitherVariant;
};
export type LineRegistration = {
	dataKey: string;
	strokeVariant: StrokeVariant;
	curveType?: CurveType;
	animationType?: ComposedAnimationType;
	connectNulls: boolean;
	glow: boolean;
	isClickable: boolean;
	dotVariant: DotVariant;
	activeDotVariant: DotVariant;
	lineProps?: Partial<LineSeriesOption>;
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
