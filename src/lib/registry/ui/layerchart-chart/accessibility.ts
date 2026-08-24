/**
 * Accessible name and description for a chart root.
 *
 * A chart may be named directly or by visible text elsewhere on the page. Descriptions can be
 * supplied directly, linked from existing content, or both. The container exposes this as a
 * `group`, rather than an image, so interactive legends and marks remain discoverable.
 */
type ChartAccessibleName =
	{ label: string; labelledBy?: never } | { label?: never; labelledBy: string };

export type ChartAccessibility = ChartAccessibleName & {
	description?: string;
	describedBy?: string;
};
