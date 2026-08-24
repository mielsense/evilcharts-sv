import type { ChartConfig } from '../../ui/layerchart-chart/chart-config.js';

// Constants
export const LOADING_ANIMATION_DURATION = 2000; // full loading cycle duration in milliseconds
export const DEFAULT_NODE_WIDTH = 10;
export const DEFAULT_NODE_PADDING = 10;
export const DEFAULT_LINK_CURVATURE = 0.5;
export const DEFAULT_ITERATIONS = 32;

/** Recharts' `<Sankey margin>` default, which the layout measures inside. */
export const CHART_MARGIN = 5;

export type LinkVariant = 'gradient' | 'solid' | 'source' | 'target';
export type NodeLabelPosition = 'inside' | 'outside';

/** Resolves the SVG paint reference for a link band based on its variant. */
export function getLinkFill(
	variant: LinkVariant,
	chartId: string,
	index: number,
	config: ChartConfig,
	sourceName: string,
	targetName: string
): string {
	switch (variant) {
		case 'gradient':
			return `url(#${chartId}-link-gradient-${index})`;
		case 'source':
			return sourceName in config ? `url(#${chartId}-sankey-colors-${sourceName})` : 'currentColor';
		case 'target':
			return targetName in config ? `url(#${chartId}-sankey-colors-${targetName})` : 'currentColor';
		case 'solid':
		default:
			return 'currentColor';
	}
}

/**
 * The band outline for one link, copied from the reference's `linkAreaPath`.
 *
 * Two cubics — the top edge out and the bottom edge back — closed into a ribbon.
 */
export function linkAreaPath({
	sourceX,
	sourceY,
	targetX,
	targetY,
	sourceControlX,
	targetControlX,
	halfWidth
}: {
	sourceX: number;
	sourceY: number;
	targetX: number;
	targetY: number;
	sourceControlX: number;
	targetControlX: number;
	halfWidth: number;
}) {
	return `M${sourceX},${sourceY - halfWidth}
    C${sourceControlX},${sourceY - halfWidth} ${targetControlX},${targetY - halfWidth} ${targetX},${targetY - halfWidth}
    L${targetX},${targetY + halfWidth}
    C${targetControlX},${targetY + halfWidth} ${sourceControlX},${sourceY + halfWidth} ${sourceX},${sourceY + halfWidth}
    Z`;
}
