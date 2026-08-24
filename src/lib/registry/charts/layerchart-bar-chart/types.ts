// Constants
export const DEFAULT_BAR_RADIUS = 2;
export const LOADING_BAR_DATA_KEY = 'loading';
export const LOADING_ANIMATION_DURATION = 2000; // in milliseconds
export const STACK_ID = 'evil-stacked';
export const BAR_GROW_DURATION = 0.5; // per-bar grow-in length, in seconds
export const BAR_STAGGER = 0.05; // delay between consecutive bars, in seconds
export const REVEAL_EASE: [number, number, number, number] = [0, 0.7, 0.5, 1]; // grow-in easing

export type BarVariant =
	'default' | 'hatched' | 'duotone' | 'duotone-reverse' | 'gradient' | 'stripped';
export type StackType = 'default' | 'stacked' | 'percent';
export type BarLayout = 'vertical' | 'horizontal';

/**
 * Order in which bars grow into view. LayerChart's own bar animation is permanently
 * disabled — every bar instead grows from its baseline (bottom for vertical
 * layout, left for horizontal), and this controls the stagger sequence.
 *
 * NOTE: the grow-in is a per-frame animation, so it is heavier than a static
 * chart. `"none"` opts out entirely; it is also what a device with the OS
 * "reduce motion" preference falls back to automatically.
 */
export type BarAnimationType =
	'none' | 'left-to-right' | 'right-to-left' | 'center-out' | 'edges-in';
