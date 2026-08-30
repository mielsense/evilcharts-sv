import { describe, expect, it } from 'vitest';
import { mergeLifecycleOptions } from './merge-options.js';

describe('mergeLifecycleOptions', () => {
	it('allows consumer options while preserving chart-owned animation settings', () => {
		const built = {
			animation: true,
			animationDuration: 1000,
			animationDurationUpdate: 0,
			backgroundColor: 'transparent'
		};

		expect(
			mergeLifecycleOptions(built, {
				animation: false,
				animationDuration: 25,
				animationDurationUpdate: 25,
				backgroundColor: '#fff'
			})
		).toEqual({
			animation: true,
			animationDuration: 1000,
			animationDurationUpdate: 0,
			backgroundColor: '#fff'
		});
	});
});
