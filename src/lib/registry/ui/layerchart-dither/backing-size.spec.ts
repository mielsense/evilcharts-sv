import { describe, expect, it } from 'vitest';
import { getCanvasBackingSize } from './backing-size.js';

describe('canvas backing size', () => {
	it('caps device pixel ratio while keeping CSS dimensions intact', () => {
		expect(getCanvasBackingSize({ width: 120, height: 80, pixelRatio: 3 })).toEqual({
			cssWidth: 120,
			cssHeight: 80,
			width: 240,
			height: 160,
			scaleX: 2,
			scaleY: 2
		});
	});

	it('bounds the backing store without distorting a large canvas', () => {
		const result = getCanvasBackingSize({
			width: 4000,
			height: 3000,
			pixelRatio: 2,
			maxPixels: 4_000_000
		});

		expect(result.width * result.height).toBeLessThanOrEqual(4_000_000);
		expect(result.width / result.height).toBeCloseTo(4 / 3, 3);
		expect(result.scaleX).toBeCloseTo(result.scaleY, 3);
	});

	it('returns an empty backing store for invalid or collapsed bounds', () => {
		expect(getCanvasBackingSize({ width: Number.NaN, height: 20, pixelRatio: 2 })).toEqual({
			cssWidth: 0,
			cssHeight: 20,
			width: 0,
			height: 0,
			scaleX: 0,
			scaleY: 0
		});
		expect(getCanvasBackingSize({ width: 20, height: -2, pixelRatio: 2 }).height).toBe(0);
	});
});
