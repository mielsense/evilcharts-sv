import { barGrowProgress } from '../../ui/layerchart-chart/intros.js';
import {
	BAR_GROW_DURATION,
	BAR_STAGGER,
	REVEAL_EASE,
	type BarAnimationType,
	type BarVariant
} from './types.js';

// Resolves the SVG paint reference for a bar's fill based on its variant
export const getVariantFill = (variant: BarVariant, id: string, dataKey: string): string => {
	switch (variant) {
		case 'hatched':
			return `url(#${id}-hatched-${dataKey})`;
		case 'duotone':
			return `url(#${id}-duotone-${dataKey})`;
		case 'duotone-reverse':
			return `url(#${id}-duotone-reverse-${dataKey})`;
		case 'gradient':
			return `url(#${id}-gradient-${dataKey})`;
		case 'stripped':
			return `url(#${id}-stripped-${dataKey})`;
		default:
			return `url(#${id}-colors-${dataKey})`;
	}
};

// Computes bar opacity from the click selection and hover-highlight state
export const getBarOpacity = ({
	isClickable,
	selectedDataKey,
	dataKey,
	enableHoverHighlight,
	isMouseInChart,
	isActive
}: {
	isClickable?: boolean;
	selectedDataKey?: string | null;
	dataKey: string;
	enableHoverHighlight?: boolean;
	isMouseInChart?: boolean;
	isActive?: boolean;
}) => {
	const isSelectedDataKey = selectedDataKey === null || selectedDataKey === dataKey;
	const clickOpacity = isClickable && selectedDataKey !== null ? (isSelectedDataKey ? 1 : 0.15) : 1;

	// While hovering, the hovered bar keeps its click opacity and the rest dim further
	if (enableHoverHighlight && isMouseInChart) {
		return isActive ? clickOpacity : clickOpacity * 0.3;
	}

	return clickOpacity;
};

/** Derives one bar's grow frame from the uninterrupted chart-owned timeline. */
export const getBarGrowProgress = (
	animationType: BarAnimationType,
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
		REVEAL_EASE
	);
