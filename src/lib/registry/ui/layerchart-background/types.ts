// ── Background Variant Types ─────────────────────────────────────────────────
// To add a new variant:
// 1. Add its name to the BackgroundVariant union type below
// 2. Create a pattern component with PatternProps
// 3. Register it in PATTERN_MAP

export type BackgroundVariant =
	| 'dots'
	| 'grid'
	| 'cross-hatch'
	| 'diagonal-lines'
	| 'plus'
	| 'falling-triangles'
	| '4-pointed-star'
	| 'tiny-checkers'
	| 'overlapping-circles'
	| 'wiggle-lines'
	| 'bubbles';

export type PatternProps = { id: string };
