import type { CurveType } from '../../ui/layerchart-chart/curves.js';

// Constants
export const STROKE_WIDTH = 2; // line stroke — also the tooltip cursor's width
export const DEFAULT_BAR_RADIUS = 4;
export const LOADING_DATA_KEY = 'loading';
export const LOADING_ANIMATION_DURATION = 2000; // in milliseconds
export const REVEAL_DURATION = 1; // line intro wipe length, in seconds
export const REVEAL_EASE: [number, number, number, number] = [0, 0.7, 0.5, 1]; // intro easing
export const BAR_GROW_DURATION = 0.5; // per-bar grow-in length, in seconds
export const BAR_STAGGER = 0.05; // delay between consecutive bars, in seconds

export type StrokeVariant = 'solid' | 'dashed' | 'animated-dashed';
export type BarVariant =
	'default' | 'hatched' | 'duotone' | 'duotone-reverse' | 'gradient' | 'stripped';

/**
 * Direction of the custom motion.dev intro. LayerChart's own animation is
 * permanently disabled — lines wipe in along this direction, while bars grow up
 * from their baseline staggered in this same order.
 *
 * NOTE: the intro is a per-frame animation, heavier than a static chart.
 * `"none"` opts out — as does a device with the OS "reduce motion" preference.
 */
export type ComposedAnimationType =
	'none' | 'left-to-right' | 'right-to-left' | 'center-out' | 'edges-in';
export type RevealAnimationType = Exclude<ComposedAnimationType, 'none'>;

// motion `originX` for each single-rect line reveal — the edge the wipe grows from
export const SINGLE_REVEAL_ORIGIN: Record<Exclude<RevealAnimationType, 'edges-in'>, number> = {
	'left-to-right': 0,
	'right-to-left': 1,
	'center-out': 0.5
};

export type { CurveType };
