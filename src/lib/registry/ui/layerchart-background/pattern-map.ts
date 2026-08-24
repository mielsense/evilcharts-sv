import type { Component } from 'svelte';
import Bubbles from './patterns/bubbles.svelte';
import CrossHatch from './patterns/cross-hatch.svelte';
import DiagonalLines from './patterns/diagonal-lines.svelte';
import Dots from './patterns/dots.svelte';
import FallingTriangles from './patterns/falling-triangles.svelte';
import FourPointedStar from './patterns/four-pointed-star.svelte';
import Grid from './patterns/grid.svelte';
import OverlappingCircles from './patterns/overlapping-circles.svelte';
import Plus from './patterns/plus.svelte';
import TinyCheckers from './patterns/tiny-checkers.svelte';
import WiggleLines from './patterns/wiggle-lines.svelte';
import type { BackgroundVariant, PatternProps } from './types.js';

// ── Pattern Registry ─────────────────────────────────────────────────────────
// Map variant names to pattern components

export const PATTERN_MAP: Record<BackgroundVariant, Component<PatternProps>> = {
	dots: Dots,
	grid: Grid,
	plus: Plus,
	bubbles: Bubbles,
	'cross-hatch': CrossHatch,
	'diagonal-lines': DiagonalLines,
	'falling-triangles': FallingTriangles,
	'4-pointed-star': FourPointedStar,
	'tiny-checkers': TinyCheckers,
	'overlapping-circles': OverlappingCircles,
	'wiggle-lines': WiggleLines
};
