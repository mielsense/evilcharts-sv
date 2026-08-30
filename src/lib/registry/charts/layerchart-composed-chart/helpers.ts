import { barGrowProgress } from '../../ui/layerchart-chart/intros.js';
import {
	BAR_GROW_DURATION,
	BAR_REVEAL_EASE,
	BAR_STAGGER,
	type BarVariant,
	type ComposedAnimationType
} from './types.js';

// Returns stroke/dot opacity for a line — dims a series only when another is selected
export const getOpacity = (selectedDataKey: string | null, dataKey: string) => {
	if (selectedDataKey === null) {
		return { stroke: 1, dot: 1 };
	}

	return selectedDataKey === dataKey ? { stroke: 1, dot: 1 } : { stroke: 0.3, dot: 0.3 };
};

// Returns the fill opacity for a bar, accounting for both selection and hover state
export const getBarOpacity = ({
	isClickable,
	isSelected,
	selectedDataKey,
	enableHoverHighlight,
	hoveredIndex,
	index
}: {
	isClickable: boolean;
	isSelected: boolean;
	selectedDataKey: string | null;
	enableHoverHighlight: boolean;
	hoveredIndex: number | null;
	index: number;
}) => {
	const clickOpacity = isClickable && selectedDataKey !== null ? (isSelected ? 1 : 0.15) : 1;

	if (enableHoverHighlight && hoveredIndex !== null) {
		return hoveredIndex === index ? clickOpacity : clickOpacity * 0.3;
	}

	return clickOpacity;
};

// Resolves the SVG paint reference for a bar's fill based on its variant
export const getVariantFill = (variant: BarVariant, id: string): string => {
	switch (variant) {
		case 'hatched':
			return `url(#${id}-hatched)`;
		case 'duotone':
			return `url(#${id}-duotone)`;
		case 'duotone-reverse':
			return `url(#${id}-duotone-reverse)`;
		case 'gradient':
			return `url(#${id}-gradient)`;
		case 'stripped':
			return `url(#${id}-stripped)`;
		default:
			return `url(#${id}-bar-colors)`;
	}
};

/** Derives one bar's grow frame from the uninterrupted chart-owned timeline. */
export const getBarGrowProgress = (
	animationType: ComposedAnimationType,
	index: number,
	dataLength: number,
	elapsedMs: number
) =>
	barGrowProgress(
		animationType,
		index,
		dataLength,
		elapsedMs,
		BAR_GROW_DURATION,
		BAR_STAGGER,
		BAR_REVEAL_EASE
	);
