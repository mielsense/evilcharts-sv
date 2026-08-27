// Constants
export const DEFAULT_INNER_RADIUS = '30%';
export const DEFAULT_OUTER_RADIUS = '100%';
export const DEFAULT_CORNER_RADIUS = 5;
export const DEFAULT_BAR_SIZE = 14;
export const LOADING_BARS = 5;
export const LOADING_ANIMATION_DURATION = 1500; // interval between skeleton data changes, in ms

/**
 * Recharts' `<RadialBar>` animation defaults, which the reference leaves switched on — it never
 * passes `isAnimationActive={false}`, so every bar sweeps out on mount.
 *
 * `RadialBar.js` interpolates `endAngle` from `startAngle` to its final value, so one progress
 * value drives the whole reveal.
 */
export const REVEAL_BEGIN = 0; // <RadialBar animationBegin>, in milliseconds
export const REVEAL_DURATION = 1500; // <RadialBar animationDuration>, in milliseconds
/** `animationEasing: "ease"` — the CSS `ease` curve. */
export const REVEAL_EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

/** Recharts' `<RadialBarChart margin>` default, which its maximum radius measures against. */
export const CHART_MARGIN = 5;

export type RadialVariant = 'full' | 'semi';

/**
 * The angle + centre configuration for the chart's arc shape, copied from the reference.
 *
 * Angles are in Recharts' polar space: degrees anticlockwise from 3 o'clock. `full` runs
 * 90 → −270, a whole turn clockwise from 12 o'clock; `semi` runs 180 → 0, the top half from
 * 9 o'clock round to 3 o'clock, with the centre pushed down to 70% so the arc fills the box.
 */
export function getVariantConfig(variant: RadialVariant) {
	switch (variant) {
		case 'semi':
			return { startAngle: 180, endAngle: 0, cx: 0.5, cy: 0.7 };
		case 'full':
		default:
			return { startAngle: 90, endAngle: -270, cx: 0.5, cy: 0.5 };
	}
}

/**
 * Converts a Recharts polar angle to the equivalent d3-arc angle, in radians.
 *
 * Recharts measures degrees anticlockwise from 3 o'clock; d3-arc measures radians clockwise from
 * 12 o'clock. Mapping `θ → (90 − θ)` handles both differences at once, so `90 → −270` becomes
 * `0 → 2π` and `180 → 0` becomes `−π/2 → π/2`.
 */
export const toArcAngle = (degrees: number) => ((90 - degrees) * Math.PI) / 180;

/** Resolves a Recharts radius (`"30%"` or a pixel number) against the plot's maximum radius. */
export const resolveRadius = (radius: number | string, maxRadius: number) => {
	if (typeof radius === 'number') return radius;

	const trimmed = radius.trim();
	if (trimmed.endsWith('%')) return (Number.parseFloat(trimmed) / 100) * maxRadius;

	const parsed = Number(trimmed);
	return Number.isFinite(parsed) ? parsed : maxRadius;
};

export type RadialRing = {
	row: Record<string, unknown>;
	index: number;
	name: string;
	/** Sweep start, in d3 radians. */
	startAngle: number;
	/** Sweep end, in d3 radians. */
	endAngle: number;
	innerRadius: number;
	outerRadius: number;
};

/**
 * Interpolates radial-bar angles as Recharts' `SectorsWithAnimation` does. Radii and row payloads
 * come from the target immediately; only the start and end angles tween. A newly added ring grows
 * from its target start angle.
 */
export function interpolateRings(
	previous: RadialRing[],
	target: RadialRing[],
	progress: number
): RadialRing[] {
	if (progress >= 1) return target;

	return target.map((ring, index) => {
		const previousRing = previous[index];
		if (!previousRing) {
			return {
				...ring,
				endAngle: ring.startAngle + (ring.endAngle - ring.startAngle) * progress
			};
		}

		return {
			...ring,
			startAngle: previousRing.startAngle + (ring.startAngle - previousRing.startAngle) * progress,
			endAngle: previousRing.endAngle + (ring.endAngle - previousRing.endAngle) * progress
		};
	});
}

/**
 * Ring geometry for every row, matching Recharts' radial band layout.
 *
 * Recharts lays a band scale across `[innerRadius, outerRadius]` with one band per row — **row 0
 * innermost** — and centres a `barSize`-thick bar in each band. Measured against the reference: a
 * 143px maximum radius with `innerRadius="30%"` and five rows gives bands of 20.02px, so row 0's
 * bar spans 45.9 → 59.9 and row 4's spans 125.98 → 139.98.
 */
export function getRings({
	rows,
	dataKey,
	nameKey,
	innerRadius,
	outerRadius,
	barSize,
	startAngle,
	endAngle,
	max
}: {
	rows: Record<string, unknown>[];
	dataKey: string;
	nameKey: string;
	innerRadius: number;
	outerRadius: number;
	barSize: number;
	/** Chart start angle, in d3 radians. */
	startAngle: number;
	/** Chart end angle, in d3 radians. */
	endAngle: number;
	/**
	 * Value a full sweep represents. Without it the largest row fills the arc, which is what
	 * Recharts does when no `<PolarAngleAxis domain>` pins the scale.
	 */
	max?: number;
}): RadialRing[] {
	if (rows.length === 0) return [];

	const valueOf = (row: Record<string, unknown>) => {
		const value = row[dataKey];
		return typeof value === 'number' && Number.isFinite(value) ? value : 0;
	};

	const total = max != null && max > 0 ? max : Math.max(0, ...rows.map(valueOf)) || 1;
	const step = (outerRadius - innerRadius) / rows.length;
	// Recharts centres a fixed-size bar by flooring the leftover space at the start of each radial
	// band. Keeping the fractional half-gap would shift every ring slightly outward (0.13px in the
	// loading example at 630x360).
	const bandOffset = Math.floor((step - barSize) / 2);

	return rows.map((row, index) => {
		const ringInnerRadius = innerRadius + step * index + bandOffset;

		return {
			row,
			index,
			name: String(row[nameKey]),
			startAngle,
			endAngle: startAngle + (endAngle - startAngle) * (valueOf(row) / total),
			innerRadius: ringInnerRadius,
			outerRadius: ringInnerRadius + barSize
		};
	});
}
