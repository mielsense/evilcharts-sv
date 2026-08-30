import type { DitherVariant } from '../../ui/echarts-dither/index.js';

export const DEFAULT_BAR_RADIUS = 2;
export type BarVariant =
	| 'default'
	| 'hatched'
	| 'duotone'
	| 'duotone-reverse'
	| 'gradient'
	| 'stripped'
	| 'blocks'
	| 'expandable'
	| 'isometric';
export type StackType = 'default' | 'stacked' | 'percent';
export type BarLayout = 'vertical' | 'horizontal';
export type BarAnimationType =
	'none' | 'left-to-right' | 'right-to-left' | 'center-out' | 'edges-in';
export type BarHoverDatum = {
	index: number;
	row: Record<string, unknown>;
};
export type BarRegistration = {
	dataKey: string;
	variant: BarVariant;
	radius?: number;
	animationType?: BarAnimationType;
	isClickable: boolean;
	enableHoverHighlight: boolean;
	glowing: boolean;
	bufferBar: boolean;
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
