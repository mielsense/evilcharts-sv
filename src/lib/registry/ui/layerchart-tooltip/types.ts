export type TooltipRoundness = 'sm' | 'md' | 'lg' | 'xl';
export type TooltipVariant = 'default' | 'frosted-glass';

export type TooltipIndicator = 'line' | 'dot' | 'dashed';

/**
 * One row of tooltip data.
 *
 * Mirrors the shape Recharts hands `<Tooltip content>` in the reference, so the content
 * component stays renderer-agnostic exactly as the reference's is. Each chart's `Tooltip`
 * part builds this list from LayerChart's `TooltipContext`.
 */
export type TooltipPayloadItem = {
	dataKey?: string;
	name?: string;
	value?: number | string | null;
	payload?: unknown;
	/** Rows with `type: 'none'` are hidden, as in Recharts. */
	type?: string;
	color?: string;
};
