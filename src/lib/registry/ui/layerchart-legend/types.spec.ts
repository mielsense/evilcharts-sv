import { describe, expect, it } from 'vitest';
import { resolveLegendPlacement } from './types.js';

describe('resolveLegendPlacement', () => {
	it('preserves the supported middle overlay position', () => {
		expect(resolveLegendPlacement('middle', 'top')).toBe('middle');
	});

	it('uses each chart family default only when no position was requested', () => {
		expect(resolveLegendPlacement(undefined, 'top')).toBe('top');
		expect(resolveLegendPlacement(undefined, 'bottom')).toBe('bottom');
	});
});
