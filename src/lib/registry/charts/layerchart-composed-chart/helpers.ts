import {
	BAR_GROW_DURATION,
	BAR_STAGGER,
	REVEAL_EASE,
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

/**
 * Builds the motion.dev grow-in animation for a single bar, or returns `null`
 * when it should render statically (`"none"`, an unknown index, or — crucially —
 * once the bar has already finished growing).
 *
 * The intro is anchored to `introStartedAt` (stamped once when the chart mounts)
 * rather than to component mount. A re-render caught mid-grow therefore resumes
 * from the progress it should already be at instead of replaying, which makes
 * the intro a true one-shot.
 */
export const getBarGrowAnimation = (
	animationType: ComposedAnimationType,
	index: number,
	dataLength: number,
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

	// Resume from wherever this bar should already be (0 before it starts)
	const from = elapsed <= startMs ? 0 : (elapsed - startMs) / durationMs;

	return {
		initial: { scaleY: from },
		animate: { scaleY: 1 },
		transition: {
			duration: (endMs - Math.max(elapsed, startMs)) / 1000,
			ease: REVEAL_EASE,
			delay: Math.max(0, startMs - elapsed) / 1000
		},
		style: { originY: 1 } // grow upward from the baseline
	};
};
