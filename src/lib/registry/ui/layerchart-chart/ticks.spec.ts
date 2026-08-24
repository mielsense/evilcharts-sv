import { scaleLinear, scalePoint } from 'd3-scale';
import { describe, expect, it } from 'vitest';
import {
	layerChartFormatter,
	rechartsAutoYAxisWidth,
	rechartsValueAxisTicks,
	thinAxisTicks
} from './ticks.js';

describe('axis parity helpers', () => {
	it('passes LayerChart tick indices through to Recharts-style formatters', () => {
		const formatter = layerChartFormatter((value, index) => `${index}:${value}`);

		expect(formatter('Feb', 1)).toBe('1:Feb');
	});

	it('thins dense category labels from the end and reports their domain indices', () => {
		const scale = scalePoint<string>()
			.domain(['January', 'February', 'March', 'April'])
			.range([0, 120]);
		const calls: Array<[unknown, number]> = [];
		const ticks = thinAxisTicks({
			minGap: 8,
			format: (value, index) => {
				calls.push([value, index]);
				return String(value);
			}
		})(scale);

		expect(ticks.at(-1)).toBe('April');
		expect(ticks.length).toBeLessThan(3);
		expect(calls).toContainEqual(['April', 3]);
	});

	it('preserves the end tick and drops the colliding penultimate mobile label', () => {
		const months = [
			'January',
			'February',
			'March',
			'April',
			'May',
			'June',
			'July',
			'August',
			'September',
			'October',
			'November',
			'December'
		];
		const scale = scalePoint<string>().domain(months).range([0, 396]);
		const ticks = thinAxisTicks({
			minGap: 8,
			leadingInset: 5,
			format: (value) => String(value).slice(0, 3)
		})(scale);

		expect(ticks).toEqual(months.slice(1, 10).concat('December'));
	});

	it('keeps the leading tick when a value axis leaves enough room for its label', () => {
		const months = [
			'January',
			'February',
			'March',
			'April',
			'May',
			'June',
			'July',
			'August',
			'September',
			'October',
			'November',
			'December'
		];
		const scale = scalePoint<string>().domain(months).range([0, 336]);
		const ticks = thinAxisTicks({
			minGap: 8,
			leadingInset: 65,
			format: (value) => String(value).slice(0, 3)
		})(scale);

		expect(ticks).toEqual(months.slice(0, 10).concat('December'));
	});

	it('matches Recharts five-tick numeric axes including both domain endpoints', () => {
		const scale = scaleLinear().domain([0, 1800]).range([124, 0]);

		expect(rechartsValueAxisTicks(scale)).toEqual([0, 450, 900, 1350, 1800]);
	});

	it('matches Recharts auto Y-axis rounding, margin, and hidden tick length', () => {
		expect(rechartsAutoYAxisWidth([7.57, 22.27, 27.59])).toBe(42);
		expect(rechartsAutoYAxisWidth([7.57, 22.59, 27.45])).toBe(41);
	});

	it('does not reinterpret vertical minTickGap as numeric tick spacing', () => {
		const scale = scaleLinear().domain([0, 100]).range([100, 0]);
		expect(scale.ticks()).toHaveLength(11);
	});
});
