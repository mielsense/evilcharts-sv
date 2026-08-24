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

/**
 * Builds the motion.dev grow-in animation for a single bar, or returns `null`
 * when the bar should render statically (`"none"`, reduced motion, an unknown
 * index, or — crucially — once the bar has already finished growing).
 *
 * Every bar grows from its baseline — `scaleY` from the bottom for vertical
 * layout, `scaleX` from the left for horizontal — and `animationType` decides
 * the stagger order, so the chart fills in one bar at a time.
 *
 * The intro is anchored to `introStartedAt` (stamped once when the chart
 * mounts) rather than to component mount, so a re-render caught mid-grow
 * resumes from the progress it should already be at instead of replaying.
 */
export const getBarGrowAnimation = (
	animationType: BarAnimationType,
	index: number,
	dataLength: number,
	isHorizontal: boolean,
	introStartedAt: number
) => {
	if (animationType === 'none' || index < 0 || dataLength <= 0) return null;

	const lastIndex = dataLength - 1;
	const center = lastIndex / 2;

	// How many bars this one waits behind before it starts growing
	let step: number;
	switch (animationType) {
		case 'right-to-left':
			step = lastIndex - index;
			break;
		case 'center-out':
			step = Math.abs(index - center);
			break;
		case 'edges-in':
			step = center - Math.abs(index - center);
			break;
		default: // left-to-right
			step = index;
	}

	const startMs = step * BAR_STAGGER * 1000;
	const durationMs = BAR_GROW_DURATION * 1000;
	const endMs = startMs + durationMs;
	const elapsed = Date.now() - introStartedAt;

	// Already finished — render static so re-renders can't replay it
	if (elapsed >= endMs) return null;

	// Resume from wherever this bar should already be: 0 before it starts,
	// partway through if a re-render caught it mid-grow.
	const from = elapsed <= startMs ? 0 : (elapsed - startMs) / durationMs;
	const transition = {
		duration: (endMs - Math.max(elapsed, startMs)) / 1000,
		ease: REVEAL_EASE,
		delay: Math.max(0, startMs - elapsed) / 1000
	};

	// Horizontal bars grow rightward from the left edge, vertical from the bottom
	return isHorizontal
		? { initial: { scaleX: from }, animate: { scaleX: 1 }, transition, style: { originX: 0 } }
		: { initial: { scaleY: from }, animate: { scaleY: 1 }, transition, style: { originY: 1 } };
};
