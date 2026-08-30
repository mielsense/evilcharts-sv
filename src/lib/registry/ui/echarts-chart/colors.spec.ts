import { describe, expect, it } from 'vitest';
import {
	buildChartCss,
	distributeColors,
	flattenColor,
	getColorsCount,
	indicatorBackground,
	withAlpha
} from './colors.js';

describe('ECharts shared colors', () => {
	it('distributes authored stops exactly like the original implementation', () => {
		expect(distributeColors(['a', 'b'], 4)).toEqual(['a', 'a', 'b', 'b']);
		expect(distributeColors(['a', 'b', 'c'], 4)).toEqual(['a', 'b', 'c', 'c']);
		expect(distributeColors([], 4)).toEqual([]);
	});

	it('keeps slot counts stable across light and dark themes', () => {
		const config = {
			desktop: { colors: { light: ['#111'], dark: ['#222', '#333'] } }
		};
		expect(getColorsCount(config.desktop)).toBe(2);
		expect(buildChartCss('chart-id', config)).toContain(
			'--color-desktop-0: #111;\n  --color-desktop-1: #111;'
		);
		expect(buildChartCss('chart-id', config)).toContain(
			'--color-desktop-0: #222;\n  --color-desktop-1: #333;'
		);
	});

	it('preserves alpha composition and shared indicator gradients', () => {
		expect(withAlpha('rgba(20, 30, 40, 0.4)', 0.5)).toBe('rgba(20, 30, 40, 0.200)');
		expect(flattenColor('rgba(200, 100, 0, 0.5)', 'rgba(20, 40, 60, 1)')).toBe('rgb(110, 70, 30)');
		expect(indicatorBackground('desktop', 3)).toBe(
			'linear-gradient(to right, var(--color-desktop-0) 0%, var(--color-desktop-1) 50%, var(--color-desktop-2) 100%)'
		);
	});
});
