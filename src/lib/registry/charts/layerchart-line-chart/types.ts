import type { CurveType } from '../../ui/layerchart-chart/curves.js';

// Constants
export const STROKE_WIDTH = 0.8; // default series stroke — <Line strokeWidth> overrides it
export const LOADING_LINE_DATA_KEY = 'loading';
export const LOADING_ANIMATION_DURATION = 2000; // in milliseconds
export const REVEAL_DURATION = 1; // intro wipe length, in seconds
export const REVEAL_EASE: [number, number, number, number] = [0, 0.7, 0.5, 1]; // intro wipe easing

export const BUFFER_DASH_SIZE = 4;
export const BUFFER_GAP_SIZE = 3;

export type StrokeVariant = 'solid' | 'dashed' | 'animated-dashed';

/**
 * Direction of the custom motion.dev intro reveal. LayerChart's own line animation
 * is permanently disabled (Recharts' equivalent drew the line after the dots had
 * already popped in) — these reveals replace it.
 *
 * NOTE: a reveal is a per-frame animated SVG mask, so it is heavier than a
 * static chart. `"none"` opts out entirely; it is also what a device with the
 * OS "reduce motion" preference falls back to automatically.
 */
export type LineAnimationType =
	'none' | 'left-to-right' | 'right-to-left' | 'center-out' | 'edges-in';
export type RevealAnimationType = Exclude<LineAnimationType, 'none'>;

// motion `originX` for each single-rect reveal — the edge the wipe grows from.
// 0 = left edge, 1 = right edge, 0.5 = centre (grows outward to both edges).
export const SINGLE_REVEAL_ORIGIN: Record<Exclude<RevealAnimationType, 'edges-in'>, number> = {
	'left-to-right': 0,
	'right-to-left': 1,
	'center-out': 0.5
};

export type { CurveType };
