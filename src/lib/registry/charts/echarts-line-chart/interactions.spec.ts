import { describe, expect, test } from 'vitest';
import {
	companionSeriesIds,
	resolveEventSeriesKey,
	sliceFromIndex,
	sliceToIndex
} from './interactions.js';

describe('ECharts line interactions', () => {
	test('recovers a line key from seriesIndex when line-body events omit seriesId', () => {
		const keys = [undefined, undefined, 'desktop', undefined, 'mobile'];

		expect(resolveEventSeriesKey({ seriesIndex: 4 }, keys)).toBe('mobile');
		expect(resolveEventSeriesKey({ seriesId: 'desktop', seriesIndex: 0 }, keys)).toBe('desktop');
		expect(
			resolveEventSeriesKey({ seriesId: '__buffer-desktop', seriesIndex: 2 }, keys)
		).toBeNull();
	});

	test('links glow and buffer companions to their parent hover highlight', () => {
		expect(
			companionSeriesIds(
				{
					dataKey: 'desktop',
					glowing: true,
					enableBufferLine: true
				},
				false,
				3
			)
		).toEqual([
			'__glow-0-desktop',
			'__glow-1-desktop',
			'__glow-2-desktop',
			'__glow-3-desktop',
			'__buffer-desktop'
		]);
	});

	test('links only the muted tail when hover reveal owns rendering', () => {
		expect(
			companionSeriesIds(
				{
					dataKey: 'desktop',
					glowing: true,
					enableBufferLine: true
				},
				true,
				3
			)
		).toEqual(['__reveal-base-desktop']);
	});

	test('slices complementary reveal geometry at the shared pointer index', () => {
		expect(sliceToIndex([10, 20, 30], 1)).toEqual([10, 20, null]);
		expect(sliceFromIndex([10, 20, 30], 1)).toEqual([null, 20, 30]);
	});
});
