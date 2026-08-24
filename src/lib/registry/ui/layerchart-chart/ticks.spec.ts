import { scaleLinear, scalePoint } from 'd3-scale';
import { describe, expect, it } from 'vitest';
import { layerChartFormatter, thinAxisTicks } from './ticks.js';

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

	it('does not reinterpret vertical minTickGap as numeric tick spacing', () => {
		const scale = scaleLinear().domain([0, 100]).range([100, 0]);
		expect(scale.ticks()).toHaveLength(11);
	});
});
