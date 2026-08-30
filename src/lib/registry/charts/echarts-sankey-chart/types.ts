import type { Snippet } from 'svelte';
import type {
	TooltipPosition,
	TooltipRoundness,
	TooltipVariant
} from '../../ui/echarts-tooltip/index.js';

export type LinkVariant = 'gradient' | 'solid' | 'source' | 'target';
export type NodeLabelPosition = 'inside' | 'outside';
export type SankeyAnimationType = 'none' | 'default';
export type SankeySelection = { dataKey: string; value: number };

export type SankeyNode = { name: string; icon?: Snippet };
export type SankeyLink = { source: number; target: number; value: number };
export type SankeyData = { nodes: SankeyNode[]; links: SankeyLink[] };

export type NodeRegistration = {
	radius: number;
	isClickable: boolean;
	label?: NodeLabelRegistration | null;
};
export type NodeLabelRegistration = {
	position?: NodeLabelPosition;
	showValues: boolean;
	valueFormatter?: (value: number) => string;
};
export type LinkRegistration = { variant: LinkVariant; verticalPadding: number };
export type TooltipRegistration = {
	variant: TooltipVariant;
	roundness: TooltipRoundness;
	cursor?: boolean;
	position: TooltipPosition;
	defaultIndex?: number;
};

export const DEFAULT_NODE_WIDTH = 10;
export const DEFAULT_NODE_PADDING = 10;
export const DEFAULT_LINK_CURVATURE = 0.5;
export const DEFAULT_ITERATIONS = 32;
export const LOADING_ANIMATION_DURATION = 2000;
