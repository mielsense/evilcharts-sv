export { default as Brush } from './brush.svelte';
export { default as BrushControls } from './brush-controls.svelte';
export type { BrushProps } from './brush.svelte';
export {
	BRUSH_BORDER_OPACITY,
	buildBrushDataZoom,
	syncBrushOverlay,
	type BrushGeometry,
	type BrushOverlayElements,
	type BrushOverlayParams,
	type BrushRange
} from './brush.js';
