// Constants
export const LOADING_SECTORS = 5;
export const LOADING_ANIMATION_DURATION = 2000; // full loading cycle duration in milliseconds
export const DEFAULT_INNER_RADIUS = 0;
export const DEFAULT_OUTER_RADIUS = '80%';
export const DEFAULT_CORNER_RADIUS = 0;
export const DEFAULT_PADDING_ANGLE = 0;
export const DEFAULT_START_ANGLE = 0;
export const DEFAULT_END_ANGLE = 360;
export const ANIMATION_BEGIN = 400; // Recharts' <Pie animationBegin>, in milliseconds
export const ANIMATION_DURATION = 1500; // Recharts' <Pie animationDuration>, in milliseconds
/** Recharts' `animationEasing: "ease"` — the CSS `ease` curve. */
export const ANIMATION_EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

/** Fill style for the pie's sectors — currently always a diagonal colour gradient. */
export type PieVariant = 'gradient';

/** Equal-sized sectors used to render the circular pulsing loading skeleton. */
export const LOADING_PIE_DATA = Array.from({ length: LOADING_SECTORS }, (_, i) => ({
	name: `loading${i}`,
	value: 100 / LOADING_SECTORS
}));

/**
 * Converts a Recharts polar angle to the equivalent d3-arc angle, in radians.
 *
 * Recharts measures degrees anticlockwise from 3 o'clock (`polarToCartesian` negates the angle
 * before taking its cosine and sine); d3-arc measures radians clockwise from 12 o'clock. Mapping
 * `θ → (90 − θ)` handles both differences at once, so a Recharts sweep of `0 → 360` becomes a
 * d3 sweep of `π/2 → −3π/2` — a full turn starting at 3 o'clock and running anticlockwise, which
 * is exactly what the reference draws.
 */
export const toArcAngle = (degrees: number) => ((90 - degrees) * Math.PI) / 180;

/**
 * Recharts' `polarToCartesian`, relative to the pie's centre.
 *
 * Degrees are measured anticlockwise from 3 o'clock, which is why the angle is negated before
 * the sine and cosine — copied straight from Recharts so labels land on the same pixels.
 */
export const polarToCartesian = (radius: number, degrees: number): [number, number] => {
	const radians = (-degrees * Math.PI) / 180;
	return [radius * Math.cos(radians), radius * Math.sin(radians)];
};

/**
 * Resolves the pie's radii to pixels, matching LayerChart's `Arc`.
 *
 * `Arc` reads a value above 1 as pixels, a fraction as a proportion of the chart radius, and a
 * negative value as an offset from it; `chartRadius` is half the smaller plot dimension, which is
 * also how Recharts derives its maximum radius. Recomputing it here lets a label be placed at
 * `(innerRadius + outerRadius) / 2` without depending on the arc element.
 */
export const resolveRadii = (
	innerRadius: number | undefined,
	outerRadius: number | undefined,
	chartRadius: number
) => {
	const outer = !outerRadius
		? chartRadius
		: outerRadius > 1
			? outerRadius
			: outerRadius > 0
				? chartRadius * outerRadius
				: chartRadius + outerRadius;

	const inner =
		innerRadius == null
			? 0
			: innerRadius > 1
				? innerRadius
				: innerRadius > 0
					? outer * innerRadius
					: innerRadius < 0
						? outer + innerRadius
						: 0;

	return { inner, outer };
};

/**
 * Resolves a Recharts radius to the number LayerChart's `Arc` expects.
 *
 * Recharts takes a pixel number or a `"80%"`-style string measured against the plot's maximum
 * radius; LayerChart reads a value above 1 as pixels and a fraction as a proportion of that same
 * maximum, so a percentage string only has to become its fraction.
 */
export const toArcRadius = (radius: number | string | undefined) => {
	if (radius === undefined) return undefined;
	if (typeof radius === 'number') return radius;

	const percent = radius.trim().endsWith('%') ? Number.parseFloat(radius) / 100 : Number(radius);
	return Number.isFinite(percent) ? percent : undefined;
};
