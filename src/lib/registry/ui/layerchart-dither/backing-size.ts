const DEFAULT_MAX_PIXEL_RATIO = 2;
const DEFAULT_MAX_PIXELS = 16_777_216;

export type CanvasBackingSizeOptions = {
	width: number;
	height: number;
	pixelRatio?: number;
	maxPixelRatio?: number;
	maxPixels?: number;
};

export type CanvasBackingSize = {
	cssWidth: number;
	cssHeight: number;
	width: number;
	height: number;
	scaleX: number;
	scaleY: number;
};

function nonNegative(value: number): number {
	return Number.isFinite(value) && value > 0 ? value : 0;
}

function positive(value: number | undefined, fallback: number): number {
	return value !== undefined && Number.isFinite(value) && value > 0 ? value : fallback;
}

export function getCanvasBackingSize(options: CanvasBackingSizeOptions): CanvasBackingSize {
	const cssWidth = nonNegative(options.width);
	const cssHeight = nonNegative(options.height);

	if (cssWidth === 0 || cssHeight === 0) {
		return { cssWidth, cssHeight, width: 0, height: 0, scaleX: 0, scaleY: 0 };
	}

	const pixelRatio = positive(options.pixelRatio, 1);
	const maxPixelRatio = positive(options.maxPixelRatio, DEFAULT_MAX_PIXEL_RATIO);
	const maxPixels = positive(options.maxPixels, DEFAULT_MAX_PIXELS);
	const desiredScale = Math.min(pixelRatio, maxPixelRatio);
	const budgetScale = Math.sqrt(maxPixels / (cssWidth * cssHeight));
	const scale = Math.min(desiredScale, budgetScale);
	const width = Math.max(1, Math.floor(cssWidth * scale));
	const height = Math.max(1, Math.floor(cssHeight * scale));

	return {
		cssWidth,
		cssHeight,
		width,
		height,
		scaleX: width / cssWidth,
		scaleY: height / cssHeight
	};
}
