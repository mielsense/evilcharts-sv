import { describe, expect, it } from 'vitest';
import { getRevealAnimation, polarIntroAction } from './intros.js';

describe('chart intro parity', () => {
	it('resumes a keyed reveal from elapsed progress instead of replaying from zero', () => {
		const first = getRevealAnimation(1, [0.25, 0.1, 0.25, 1], 1_000, 1_250);
		const remount = getRevealAnimation(1, [0.25, 0.1, 0.25, 1], 1_000, 1_600);

		expect(first?.initial.scaleX).toBeCloseTo(0.25);
		expect(remount?.initial.scaleX).toBeCloseTo(0.6);
		expect(remount!.initial.scaleX).toBeGreaterThan(first!.initial.scaleX);
		expect(getRevealAnimation(1, [0.25, 0.1, 0.25, 1], 1_000, 2_100)).toBeNull();
	});

	it('resets while loading and starts when polar content becomes visible', () => {
		expect(polarIntroAction(false, true, false)).toBe('reset');
		expect(polarIntroAction(true, false, false)).toBe('animate');
		expect(polarIntroAction(true, false, true)).toBe('finish');
	});
});
