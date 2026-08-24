export type ChartLegendVariant =
	| 'square'
	| 'circle'
	| 'circle-outline'
	| 'rounded-square'
	| 'rounded-square-outline'
	| 'vertical-bar'
	| 'horizontal-bar';

export type LegendAlign = 'left' | 'center' | 'right';
export type LegendVerticalAlign = 'top' | 'middle' | 'bottom';

/**
 * One legend entry.
 *
 * Mirrors the shape Recharts hands `<Legend content>` in the reference: `value` carries the
 * series name for pie charts, `dataKey` for cartesian charts, and `payload` the raw row so
 * `nameKey` can reach into it.
 */
export type LegendPayloadItem = {
	value?: string;
	dataKey?: string;
	payload?: unknown;
	/** Entries typed `'none'` are hidden, as in Recharts. */
	type?: string;
	color?: string;
};
