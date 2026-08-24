import { describe, expect, it } from 'vitest';
import { bayerThreshold, shouldPaintDitherCell } from './bayer.js';

describe('ordered dither thresholding', () => {
	it('visits every threshold once in each 4 by 4 tile', () => {
		const thresholds = Array.from({ length: 4 }, (_, y) =>
			Array.from({ length: 4 }, (_, x) => bayerThreshold(x, y))
		)
			.flat()
			.sort((a, b) => a - b);

		expect(thresholds).toEqual(Array.from({ length: 16 }, (_, index) => (index + 0.5) / 16));
	});

	it('keeps a 2 CSS pixel cell stable within the repeating tile', () => {
		expect(bayerThreshold(0, 0, { cellSize: 2 })).toBe(bayerThreshold(1, 1, { cellSize: 2 }));
		expect(bayerThreshold(0, 0, { cellSize: 2 })).toBe(bayerThreshold(8, 8, { cellSize: 2 }));
		expect(bayerThreshold(2, 0, { cellSize: 2 })).not.toBe(bayerThreshold(0, 0, { cellSize: 2 }));
	});

	it('handles coverage boundaries without dropping solid fills', () => {
		expect(shouldPaintDitherCell(0, 0, 0)).toBe(false);
		expect(shouldPaintDitherCell(0, 0, 1)).toBe(true);
		expect(shouldPaintDitherCell(0, 0, 0.04)).toBe(true);
		expect(shouldPaintDitherCell(3, 0, 0.04)).toBe(false);
	});
});
