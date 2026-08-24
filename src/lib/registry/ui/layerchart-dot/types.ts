export type DotVariant = 'default' | 'border' | 'colored-border';

export type ChartDotProps = {
	cx?: number;
	cy?: number;
	dataKey: string;
	chartId: string;
	class?: string;
	fillOpacity?: number;
	type?: DotVariant;
	/** Optional SVG <mask> id — lets the dot share an area's intro reveal wipe. */
	maskId?: string;
	/**
	 * Left edge and width of the gradient rect each dot is clipped out of.
	 *
	 * The reference draws a plot-wide rect and clips it to a circle, so a dot samples the series'
	 * horizontal gradient at its own x. That assumes the origin is the plot's left edge, which is
	 * true in a cartesian chart but not inside a centred `<Group>` — there, `x="0"` starts at the
	 * *centre* and every dot left of it disappeared. A radial chart passes its own plot span.
	 */
	gradientX?: number | string;
	gradientWidth?: number | string;
};

export type DotVariantProps = {
	cx: number;
	cy: number;
	dotId: string;
	fillOpacity: number;
	gradientUrl: string;
	class?: string;
	maskId?: string;
	gradientX: number | string;
	gradientWidth: number | string;
};
