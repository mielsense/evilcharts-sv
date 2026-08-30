import type { DitherVariant } from './types.js';

const BAYER_4 = [
	[0, 8, 2, 10],
	[12, 4, 14, 6],
	[3, 11, 1, 9],
	[15, 7, 13, 5]
] as const;

const DEFAULT_PATTERN_HEIGHT = 256;

export type DitherPatternOptions = {
	height?: number;
	offsetY?: number;
	reverse?: boolean;
};

export type EChartsDitherPattern = {
	image: HTMLCanvasElement;
	repeat: 'repeat-x';
	imageWidth: number;
	imageHeight: number;
	y?: number;
};

function clampUnit(value: number): number {
	return Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));
}

export function ditherVariantCoverage(
	variant: DitherVariant,
	x: number,
	y: number,
	relativeY: number,
	reverse = false
): number {
	const vertical = reverse ? relativeY : 1 - relativeY;
	if (variant === 'solid') return 0.875;
	if (variant === 'dotted') return 0.3125;
	if (variant === 'hatched') {
		return (Math.floor(x / 2) + Math.floor(y / 2)) % 4 < 2 ? 0.75 : 0.125;
	}
	return 0.18 + vertical * 0.72;
}

function colorAt(colors: readonly string[], position: number): string {
	const index = Math.min(
		colors.length - 1,
		Math.max(0, Math.floor(clampUnit(position) * colors.length))
	);
	return colors[index] ?? 'transparent';
}

/**
 * Create the ordered-dither image used by ECharts Canvas and SVG renderers.
 *
 * The image repeats only horizontally so density and multi-stop colors can vary over the full
 * shape height, matching the LayerChart painter instead of repeating a four-row pseudo-gradient.
 */
export function createDitherPattern(
	colors: readonly string[],
	variant: DitherVariant = 'gradient',
	cellSize = 2,
	opacity = 1,
	options: DitherPatternOptions = {}
): EChartsDitherPattern | string {
	if (typeof document === 'undefined') return colors[0] ?? 'transparent';
	if (colors.length === 0) return 'transparent';
	const size = Math.max(1, Math.floor(cellSize));
	const requestedHeight = Number.isFinite(options.height)
		? Math.max(size, Math.ceil((options.height ?? size) / size) * size)
		: DEFAULT_PATTERN_HEIGHT;
	const canvas = document.createElement('canvas');
	canvas.width = size * 4;
	canvas.height = requestedHeight;
	const context = canvas.getContext('2d');
	if (!context) return colors[0] ?? 'transparent';
	context.clearRect(0, 0, canvas.width, canvas.height);
	context.globalAlpha = clampUnit(opacity);
	const rows = canvas.height / size;
	for (let y = 0; y < rows; y += 1) {
		for (let x = 0; x < 4; x += 1) {
			const centerX = x * size + size / 2;
			const centerY = y * size + size / 2;
			const relativeY = clampUnit(centerY / canvas.height);
			const amount = ditherVariantCoverage(variant, centerX, centerY, relativeY, options.reverse);
			const threshold = ((BAYER_4[y % 4]?.[x] ?? 16) + 0.5) / 16;
			if (amount <= threshold) continue;
			context.fillStyle = colorAt(colors, options.reverse ? 1 - relativeY : relativeY);
			context.fillRect(x * size, y * size, size, size);
		}
	}
	return {
		image: canvas,
		repeat: 'repeat-x',
		imageWidth: canvas.width,
		imageHeight: canvas.height,
		...(Number.isFinite(options.offsetY) ? { y: options.offsetY } : {})
	};
}
