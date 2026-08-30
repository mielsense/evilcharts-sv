import { describe, expect, it } from 'vitest';
import { barGrowProgress, polarIntroAction, revealMaskRects, revealProgress } from './intros.js';

describe('chart intro parity', () => {
	it('derives a monotonic reveal from one uninterrupted elapsed timeline', () => {
		const ease = [0, 0.7, 0.5, 1] as const;
		const first = revealProgress(250, 1, [...ease]);
		const later = revealProgress(600, 1, [...ease]);

		expect(revealProgress(0, 1, [...ease])).toBeCloseTo(0, 3);
		expect(first).toBeGreaterThan(0.25);
		expect(later).toBeGreaterThan(first);
		expect(revealProgress(1_000, 1, [...ease])).toBeCloseTo(1, 3);
	});

	it('keeps every directional mask on the same progress frame', () => {
		expect(revealMaskRects('left-to-right', 0.4)).toEqual([{ x: 0, width: 40 }]);
		expect(revealMaskRects('right-to-left', 0.4)).toEqual([{ x: 60, width: 40 }]);
		expect(revealMaskRects('center-out', 0.4)).toEqual([{ x: 30, width: 40 }]);
		expect(revealMaskRects('edges-in', 0.4)).toEqual([
			{ x: 0, width: 20 },
			{ x: 80, width: 20 }
		]);
	});

	it('derives staggered bars without restarting their easing', () => {
		const ease: [number, number, number, number] = [0, 0.7, 0.5, 1];
		const first = barGrowProgress('left-to-right', 0, 3, 200, 0.5, 0.05, ease);
		const second = barGrowProgress('left-to-right', 1, 3, 200, 0.5, 0.05, ease);
		const later = barGrowProgress('left-to-right', 0, 3, 350, 0.5, 0.05, ease);

		expect(first).not.toBeNull();
		expect(second).not.toBeNull();
		expect(first!).toBeGreaterThan(second!);
		expect(later!).toBeGreaterThan(first!);
	});

	it('resets while loading and starts when polar content becomes visible', () => {
		expect(polarIntroAction(false, true, false)).toBe('reset');
		expect(polarIntroAction(true, false, false)).toBe('animate');
		expect(polarIntroAction(true, false, true)).toBe('finish');
	});
});
