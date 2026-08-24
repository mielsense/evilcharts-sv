import type { CurveType } from '../layerchart-chart/curves.js';
import type { ChartConfig } from '../layerchart-chart/chart-config.js';

// ─── Types ──────────────────────────────────────────────────────────────────

export type EvilBrushVariant = 'line' | 'area' | 'bar';

export interface EvilBrushRange {
	startIndex: number;
	endIndex: number;
}

// ─── Brush marker — the declarative `<Chart.Brush/>` child ─────────────────────
// Renders nothing; its PRESENCE turns the brush footer on (replacing the old
// showBrush prop) and its props carry the brush's height, handle-label
// formatter, and range callback. Shared so every cartesian chart attaches the
// SAME component to its root.

export interface BrushProps {
	height?: number; // brush preview strip height in px
	formatLabel?: (value: unknown, index: number) => string; // formats the range-handle labels
	onChange?: (range: EvilBrushRange) => void; // fires as the range moves
}

export type StrokeVariant = 'solid' | 'dashed' | 'animated-dashed';

export interface EvilBrushProps {
	/** Full dataset – always rendered in the miniature chart */
	data: Record<string, unknown>[];
	/** Chart config with colour definitions */
	chartConfig: ChartConfig;
	/** Data keys to plot (default: all keys from chartConfig) */
	dataKeys?: string[];
	/** X-axis data key – used for handle labels */
	xDataKey?: string;
	/** Visual variant of the mini chart */
	variant?: EvilBrushVariant;
	/** Pixel height of the brush */
	height?: number;
	/** Extra class */
	class?: string;
	/** Whether areas/bars should be stacked in the mini chart */
	stacked?: boolean;
	/** Stroke variant for line / area strokes in the mini chart */
	strokeVariant?: StrokeVariant;
	/** Whether to connect null data points in line / area variants */
	connectNulls?: boolean;
	/** Radius for bar corners in the bar variant */
	barRadius?: number;

	// ── Controlled mode ──────────────────────────────────────────────────
	/** Controlled start index */
	startIndex?: number;
	/** Controlled end index */
	endIndex?: number;

	// ── Uncontrolled mode ────────────────────────────────────────────────
	/** Initial start index (uncontrolled) */
	defaultStartIndex?: number;
	/** Initial end index (uncontrolled) */
	defaultEndIndex?: number;

	/** Fired whenever the visible range changes */
	onChange?: (range: EvilBrushRange) => void;
	/** Format the handle label from the xDataKey value */
	formatLabel?: (value: unknown, index: number) => string;
	/** Curve type for line / area variants */
	curveType?: CurveType;
	/** Minimum number of data points that must remain selected */
	minSpan?: number;
	/** Whether to render labels on the handles */
	showLabels?: boolean;
	/** Skip rendering own ChartStyle (when inside a ChartContainer that already provides CSS vars) */
	skipStyle?: boolean;
}

// ─── Pointer-capture drag ───────────────────────────────────────────────────
// Uses the modern Pointer Events API. setPointerCapture routes all pointer
// events to the originating element, so we get mouse + touch + pen support with
// zero global listeners.

export type DragType = 'left' | 'right' | 'middle';

export interface DragState {
	type: DragType;
	originX: number;
	originRange: EvilBrushRange;
}

// ─── Spring config ──────────────────────────────────────────────────────────

export const SPRING_CONFIG = { stiffness: 300, damping: 35, mass: 0.8 };

/**
 * The mini chart pins its bars to a fixed width with a small gap, matching the reference's
 * `<BarChart barGap={2} barSize={14}>`.
 */
export const MINI_BAR_SIZE = 14;
export const MINI_BAR_GAP = 2;
