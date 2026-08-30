import type { DitherVariant } from './types.js';

const BAYER_4 = [
	[0, 8, 2, 10],
	[12, 4, 14, 6],
	[3, 11, 1, 9],
	[15, 7, 13, 5]
] as const;

function coverage(variant: DitherVariant, x: number, y: number): number {
	if (variant === 'solid') return 0.875;
	if (variant === 'dotted') return 0.3125;
	if (variant === 'hatched') return (x + y) % 4 < 2 ? 0.75 : 0.125;
	return 0.625;
}

/** Create the small ordered-dither tile used as an ECharts canvas pattern. */
export function createDitherPattern(
	colors: readonly string[],
	variant: DitherVariant = 'gradient',
	cellSize = 2,
	opacity = 1
): { image: HTMLCanvasElement; repeat: 'repeat' } | string {
	if (typeof document === 'undefined') return colors[0] ?? 'transparent';
	const size = Math.max(1, Math.floor(cellSize));
	const canvas = document.createElement('canvas');
	canvas.width = size * 4;
	canvas.height = size * 4;
	const context = canvas.getContext('2d');
	if (!context) return colors[0] ?? 'transparent';
	context.clearRect(0, 0, canvas.width, canvas.height);
	context.globalAlpha = Math.min(1, Math.max(0, opacity));
	for (let y = 0; y < 4; y += 1) {
		for (let x = 0; x < 4; x += 1) {
			const amount = coverage(variant, x, y);
			if ((BAYER_4[y]?.[x] ?? 16) / 16 >= amount) continue;
			const colorIndex = colors.length > 1 ? Math.floor((y / 4) * colors.length) : 0;
			context.fillStyle = colors[Math.min(colors.length - 1, colorIndex)] ?? 'transparent';
			context.fillRect(x * size, y * size, size, size);
		}
	}
	return { image: canvas, repeat: 'repeat' };
}

