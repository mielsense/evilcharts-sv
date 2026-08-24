// Constants
export const STROKE_WIDTH = 1;
export const DEFAULT_FILL_OPACITY = 0.3;
export const LOADING_POINTS = 6;
export const LOADING_ANIMATION_DURATION = 1500; // in milliseconds
export const LOADING_RADAR_DATA_KEY = 'value';

/**
 * Recharts' `<Radar>` animation defaults, which the reference leaves switched on — unlike the
 * cartesian charts, it never passes `isAnimationActive={false}`, so the radar grows out of the
 * centre on mount.
 *
 * `Radar.js` interpolates every point from `(cx, cy)` to its final position, which for a polygon
 * centred on the origin is a uniform scale.
 */
export const REVEAL_BEGIN = 0; // <Radar animationBegin>, in milliseconds
export const REVEAL_DURATION = 1500; // <Radar animationDuration>, in milliseconds
/** `animationEasing: "ease"` — the CSS `ease` curve. */
export const REVEAL_EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

/**
 * Recharts' `<RadarChart outerRadius>` defaults to 80% of the largest circle that fits the plot,
 * which is `min(width, height) / 2`. LayerChart's radial `yRange` defaults to the full
 * `height / 2`, so the root sets it explicitly.
 */
export const DEFAULT_OUTER_RADIUS_RATIO = 0.8;

export type RadarVariant = 'filled' | 'lines';

/** Categories the loading skeleton cycles through. */
export const LOADING_CATEGORIES = ['A', 'B', 'C', 'D', 'E', 'F'];
