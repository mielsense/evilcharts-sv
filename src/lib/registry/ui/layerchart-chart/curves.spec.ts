import { line } from 'd3-shape';
import { describe, expect, it } from 'vitest';
import { CURVE_TYPES, resolveCurve, type CurveType } from './curves.js';

const POINTS: Array<[number, number]> = [
	[0, 0],
	[10, 40],
	[20, 10],
	[30, 30],
	[40, 5]
];

function pathFor(type: CurveType | undefined) {
	return line<[number, number]>()
		.x((d) => d[0])
		.y((d) => d[1])
		.curve(resolveCurve(type) as never)(POINTS);
}

describe('resolveCurve', () => {
	it('covers every Recharts curve name', () => {
		expect(CURVE_TYPES).toEqual([
			'basis',
			'basisClosed',
			'basisOpen',
			'bumpX',
			'bumpY',
			'bump',
			'linear',
			'linearClosed',
			'natural',
			'monotoneX',
			'monotoneY',
			'monotone',
			'step',
			'stepBefore',
			'stepAfter'
		]);
	});

	it('defaults to linear', () => {
		expect(pathFor(undefined)).toBe(pathFor('linear'));
	});

	it('aliases bump to bumpX and monotone to monotoneX, as Recharts does', () => {
		expect(pathFor('bump')).toBe(pathFor('bumpX'));
		expect(pathFor('monotone')).toBe(pathFor('monotoneX'));
	});

	it('produces a stable path per curve', () => {
		const paths = Object.fromEntries(CURVE_TYPES.map((t) => [t, pathFor(t)]));
		expect(paths).toMatchSnapshot();
	});

	it('gives every non-aliased curve a distinct path', () => {
		const distinct = new Set(CURVE_TYPES.map((t) => pathFor(t)));
		// `bump`/`bumpX` and `monotone`/`monotoneX` collide by design.
		expect(distinct.size).toBe(CURVE_TYPES.length - 2);
	});
});
