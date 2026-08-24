import type { DitherPaintFrame } from './invalidation.js';

export type RenderStyle = 'svg' | 'dither';
export type DitherVariant = 'gradient' | 'dotted' | 'hatched' | 'solid';
export type DitherBloom = 'off' | 'low' | 'high' | 'aura';

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
