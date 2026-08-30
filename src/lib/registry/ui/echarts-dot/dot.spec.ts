import { describe, expect, it } from 'vitest';
import { DOT_SIZES, dotItemStyle, dotStyle, sampleGradient } from './dot.js';

describe('ECharts dot helpers', () => {
	it('preserves the original marker dimensions and paint variants', () => {
		expect(DOT_SIZES).toEqual({
			none: 0,
			default: 6,
			border: 8,
			'colored-border': 6,
			ping: 8
		});
		expect(dotStyle('border', '#123456', '#fff')).toEqual({
			size: 8,
			itemStyle: { color: '#123456', borderColor: '#fff', borderWidth: 2 }
		});
		expect(dotItemStyle('colored-border', '#123456', '#fff')).toEqual({
			color: '#fff',
			borderColor: '#123456',
			borderWidth: 1
		});
		expect(dotItemStyle('ping', '#369', '#fff')).toEqual({
			color: '#369',
			borderColor: 'rgba(51, 102, 153, 0.28)',
			borderWidth: 10
		});
	});

	it('samples chart-wide multi-stop gradients at the requested position', () => {
		expect(sampleGradient(['rgba(0, 0, 0, 1)', 'rgba(100, 50, 200, 0.5)'], 0.25)).toBe(
			'rgba(25, 13, 50, 0.875)'
		);
		expect(sampleGradient([], 0.5)).toBe('rgba(120, 120, 120, 1)');
	});
});
