import type { DitherPaintFrame } from './invalidation.js';

export type DitherCanvasFrame = DitherPaintFrame & {
	canvas: HTMLCanvasElement;
	context: CanvasRenderingContext2D;
	width: number;
	height: number;
	backingWidth: number;
	backingHeight: number;
	scaleX: number;
	scaleY: number;
	resolveColor: (value: string) => string | null;
};

export type DitherCanvasPainter = (frame: DitherCanvasFrame) => void;

export type DitherRevision = string | number | boolean | null | undefined;
