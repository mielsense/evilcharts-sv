import { afterEach, describe, expect, it, vi } from 'vitest';
import { createDitherPattern, ditherVariantCoverage } from './pattern.js';

type PaintedCell = { color: string; x: number; y: number; width: number; height: number };

function stubCanvas() {
	const painted: PaintedCell[] = [];
	let fillStyle = '';
	const context = {
		clearRect: vi.fn(),
		globalAlpha: 1,
		get fillStyle() {
			return fillStyle;
		},
		set fillStyle(value: string) {
			fillStyle = value;
		},
		fillRect(x: number, y: number, width: number, height: number) {
			painted.push({ color: fillStyle, x, y, width, height });
		}
	};
	const canvas = {
		width: 0,
		height: 0,
		getContext: () => context,
		toDataURL: () => 'data:image/png;base64,dither'
	};
	vi.stubGlobal('document', { createElement: () => canvas });
	return { canvas, context, painted };
}

afterEach(() => vi.unstubAllGlobals());

describe('createDitherPattern', () => {
	it('matches LayerChart gradient coverage and reversal', () => {
		expect(ditherVariantCoverage('gradient', 1, 1, 0.1)).toBeCloseTo(0.828);
		expect(ditherVariantCoverage('gradient', 1, 15, 0.9)).toBeCloseTo(0.252);
		expect(ditherVariantCoverage('gradient', 1, 1, 0.1, true)).toBeCloseTo(0.252);
		expect(ditherVariantCoverage('solid', 1, 1, 0.1)).toBe(0.875);
		expect(ditherVariantCoverage('dotted', 1, 1, 0.1)).toBe(0.3125);
		expect(ditherVariantCoverage('hatched', 1, 1, 0.1)).not.toBe(
			ditherVariantCoverage('hatched', 5, 1, 0.1)
		);
	});

	it('renders a full-height gradient that repeats only horizontally', () => {
		const { canvas, painted } = stubCanvas();
		const pattern = createDitherPattern(['top', 'bottom'], 'gradient', 2, 0.75, {
			height: 16,
			offsetY: 11
		});

		expect(pattern).toMatchObject({
			image: canvas,
			repeat: 'repeat-x',
			imageWidth: 8,
			imageHeight: 16,
			y: 11
		});
		expect(canvas).toMatchObject({ width: 8, height: 16 });
		expect(painted.filter((cell) => cell.y < 8).length).toBeGreaterThan(
			painted.filter((cell) => cell.y >= 8).length
		);
		expect(painted.some((cell) => cell.color === 'top')).toBe(true);
		expect(painted.some((cell) => cell.color === 'bottom')).toBe(true);
	});

	it('reverses both density and vertical color order', () => {
		const { painted } = stubCanvas();
		createDitherPattern(['top', 'bottom'], 'gradient', 2, 1, { height: 16, reverse: true });

		expect(painted.filter((cell) => cell.y < 8).length).toBeLessThan(
			painted.filter((cell) => cell.y >= 8).length
		);
		expect(painted.find((cell) => cell.y < 8)?.color).toBe('bottom');
		expect([...painted].reverse().find((cell) => cell.y >= 8)?.color).toBe('top');
	});

	it('uses Bayer half-step thresholds and clamps opacity', () => {
		const { context, painted } = stubCanvas();
		createDitherPattern(['ink'], 'solid', 2, 4, { height: 8 });

		expect(context.globalAlpha).toBe(1);
		expect(painted).toHaveLength(14);
	});

	it('falls back to a stable color when no DOM canvas is available', () => {
		vi.stubGlobal('document', undefined);
		expect(createDitherPattern(['ink'])).toBe('ink');
		expect(createDitherPattern([])).toBe('transparent');
	});
});
