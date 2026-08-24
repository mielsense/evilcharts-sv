import { describe, expect, it } from 'vitest';
import { cubicBezierProgress } from './dom-marks.js';

describe('dither DOM geometry helpers', () => {
	it('evaluates reveal easing at stable endpoints', () => {
		expect(cubicBezierProgress(0, 0, 0.7, 0.5, 1)).toBeCloseTo(0, 3);
		expect(cubicBezierProgress(1, 0, 0.7, 0.5, 1)).toBeCloseTo(1, 3);
		expect(cubicBezierProgress(0.5, 0, 0.7, 0.5, 1)).toBeGreaterThan(0.5);
	});
});
