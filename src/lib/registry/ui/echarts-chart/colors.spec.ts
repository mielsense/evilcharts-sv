import { describe, expect, it } from 'vitest';
import {
	buildChartCss,
	chartColorToken,
	chartColorVariable,
	chartColorVariableName,
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

	it('generates stable CSS tokens for arbitrary public config keys', () => {
		const encoded = 'u-00005400006f00007400006100006c00002000005300006100006c000065000073';
		expect(chartColorToken('desktop')).toBe('desktop');
		expect(chartColorToken('Total Sales')).toBe(encoded);
		expect(chartColorVariableName('Total Sales', 1)).toBe(`--color-${encoded}-1`);
		expect(chartColorVariable('Total Sales', 1, 0)).toBe(
			`var(--color-${encoded}-1, var(--color-${encoded}-0))`
		);

		const css = buildChartCss('chart-sales"]{}', {
			'Total Sales': { colors: { light: ['#ff3e00'], dark: ['#ff3e00'] } }
		});
		expect(css).toContain('[data-chart="chart-sales\\"]{}"]');
		expect(css).toContain(`--color-${encoded}-0: #ff3e00;`);
	});
});
