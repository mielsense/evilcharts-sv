import type { AreaVariant } from './types.js';

// Returns fill/stroke/dot opacity — dims a series only when another is selected
export const getOpacity = (selectedDataKey: string | null, dataKey: string) => {
	if (selectedDataKey === null) {
		return { fill: 0.8, stroke: 1, dot: 1 };
	}

	return selectedDataKey === dataKey
		? { fill: 0.8, stroke: 1, dot: 1 }
		: { fill: 0.1, stroke: 0.3, dot: 0.3 };
};

// Resolves the SVG paint reference for an area's fill based on its variant
export const getFillPattern = (
	variant: AreaVariant,
	showUnselected: boolean,
	id: string
): string => {
	// A non-selected area in a clickable chart is striped to recede visually
	if (showUnselected) return `url(#${id}-unselected)`;

	return `url(#${id}-${variant})`;
};
