export { bayerThreshold, shouldPaintDitherCell, type BayerOptions } from './bayer.js';
export {
	getCanvasBackingSize,
	type CanvasBackingSize,
	type CanvasBackingSizeOptions
} from './backing-size.js';
export { resolveDitherColor, type CssVariableReader } from './color.js';
export { default as DitherCanvas } from './dither-canvas.svelte';
export {
	createDitherInvalidator,
	type DitherInvalidationReason,
	type DitherInvalidator,
	type DitherPaintFrame,
	type FrameDriver
} from './invalidation.js';
export {
	ditherCells,
	normalizeDitherBounds,
	paintDitherArc,
	paintDitherPath,
	paintDitherPolygon,
	paintDitherRect,
	paintDitherStroke,
	type DitherArc,
	type DitherBounds,
	type DitherCell,
	type DitherCellOptions,
	type DitherCoverage,
	type DitherCoverageSample,
	type DitherShapeOptions,
	type DitherStrokeOptions
} from './paint.js';
export type { DitherCanvasFrame, DitherCanvasPainter, DitherRevision } from './types.js';
