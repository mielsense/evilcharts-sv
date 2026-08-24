import { describe, expect, it } from 'vitest';
import { clampRange, panRange } from './clamp.js';

const opts = (mode?: 'left' | 'right' | 'middle') => ({ totalPoints: 30, minSpan: 2, mode });

describe('clampRange', () => {
	it('keeps both indices inside the dataset', () => {
		expect(clampRange({ startIndex: -5, endIndex: 99 }, opts())).toEqual({
			startIndex: 0,
			endIndex: 29
		});
	});

	it('stops the left handle minSpan short of the right one', () => {
		expect(clampRange({ startIndex: 25, endIndex: 20 }, opts('left'))).toEqual({
			startIndex: 18,
			endIndex: 20
		});
	});

	it('never moves the right handle while dragging the left', () => {
		expect(clampRange({ startIndex: 4, endIndex: 20 }, opts('left')).endIndex).toBe(20);
	});

	it('pushes the right handle out to minSpan when it crosses the left', () => {
		expect(clampRange({ startIndex: 10, endIndex: 5 }, opts('right'))).toEqual({
			startIndex: 10,
			endIndex: 12
		});
	});

	it('never moves the left handle while dragging the right', () => {
		expect(clampRange({ startIndex: 4, endIndex: 25 }, opts('right')).startIndex).toBe(4);
	});

	it('widens a too-narrow range without a drag mode', () => {
		expect(clampRange({ startIndex: 10, endIndex: 10 }, opts())).toEqual({
			startIndex: 10,
			endIndex: 12
		});
	});

	it('pulls the start back when the end is already at the maximum', () => {
		expect(clampRange({ startIndex: 29, endIndex: 29 }, opts())).toEqual({
			startIndex: 27,
			endIndex: 29
		});
	});

	it('degrades gracefully for a single-point dataset', () => {
		expect(clampRange({ startIndex: 0, endIndex: 5 }, { totalPoints: 1, minSpan: 2 })).toEqual({
			startIndex: 0,
			endIndex: 0
		});
	});
});

describe('panRange', () => {
	it('translates the window without changing its span', () => {
		expect(panRange({ startIndex: 5, endIndex: 15 }, 4, 30)).toEqual({
			startIndex: 9,
			endIndex: 19
		});
	});

	it('clamps at the left edge and keeps the span', () => {
		expect(panRange({ startIndex: 5, endIndex: 15 }, -20, 30)).toEqual({
			startIndex: 0,
			endIndex: 10
		});
	});

	it('clamps at the right edge and keeps the span', () => {
		expect(panRange({ startIndex: 5, endIndex: 15 }, 40, 30)).toEqual({
			startIndex: 19,
			endIndex: 29
		});
	});

	it('handles a window wider than the dataset', () => {
		expect(panRange({ startIndex: 0, endIndex: 40 }, 5, 30)).toEqual({
			startIndex: 0,
			endIndex: 29
		});
	});
});
