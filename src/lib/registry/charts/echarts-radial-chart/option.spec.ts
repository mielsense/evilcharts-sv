import { describe, expect, it } from 'vitest';
import { buildRadialOption, mergeRadialChartOptions, niceCeil } from './option.js';

function asArray<T>(value: T | T[] | undefined): T[] {
	return value === undefined ? [] : Array.isArray(value) ? value : [value];
}

const resolved = {
	series: { alpha: ['#ff0000'], beta: ['#0000ff'] },
	tokens: {
		mutedForeground: 'rgba(120, 120, 120, 1)',
		border: 'rgba(120, 120, 120, 0.35)',
		foreground: 'rgba(20, 20, 20, 1)',
		background: 'rgba(255, 255, 255, 1)'
	}
};

describe('buildRadialOption', () => {
	it('uses separate polar systems so tracks do not consume the data bar band', () => {
		const option = buildRadialOption({
			categories: ['alpha', 'beta'],
			values: [40, 80],
			config: { alpha: { label: 'Alpha' }, beta: { label: 'Beta' } },
			radialBar: {
				dataKey: 'value',
				cornerRadius: 5,
				barSize: 14,
				showBackground: true,
				isClickable: true
			},
			variant: 'semi',
			innerRadius: '30%',
			outerRadius: '100%',
			angleMax: 100,
			selectedBar: 'alpha',
			tooltip: undefined,
			isLoading: false,
			loadingData: [50, 60, 70, 80, 90],
			resolved,
			animation: true,
			reducedMotion: false
		});

		const series = asArray(option.series);
		expect(asArray(option.polar)).toHaveLength(2);
		expect(series).toHaveLength(2);
		expect(series[0]).toMatchObject({ id: 'radial-bars', polarIndex: 0 });
		expect(series[1]).toMatchObject({ id: '__track', polarIndex: 1, silent: true });
		expect(asArray(option.angleAxis)[0]).toMatchObject({ startAngle: 180, endAngle: 0, max: 100 });
		expect(asArray(series[0]?.data)[0]).toMatchObject({ name: 'alpha', value: 40 });
		expect(asArray(series[0]?.data)[1]).toMatchObject({ itemStyle: { opacity: 0.15 } });
		expect(option.aria).toMatchObject({
			enabled: true,
			label: { description: 'Radial chart values: Alpha 40, Beta 80.' }
		});
	});

	it('builds a silent five-ring loading skeleton and disables motion when reduced', () => {
		const option = buildRadialOption({
			categories: [],
			values: [],
			config: {},
			radialBar: {
				dataKey: 'value',
				cornerRadius: 5,
				barSize: 14,
				showBackground: true,
				isClickable: false
			},
			variant: 'full',
			innerRadius: '30%',
			outerRadius: '100%',
			angleMax: 1,
			selectedBar: null,
			tooltip: undefined,
			isLoading: true,
			loadingData: [50, 60, 70, 80, 90],
			resolved,
			animation: true,
			reducedMotion: true
		});

		expect(option.tooltip).toEqual({ show: false });
		expect(option.aria).toEqual({ enabled: false });
		const series = asArray(option.series);
		expect(series.map((item) => item.id)).toEqual(['__loading-track', '__loading']);
		expect(asArray(series[1]?.data)).toHaveLength(5);
		expect(option.animation).toBe(false);
	});

	it('computes a stable nice ceiling for data-driven gauges', () => {
		expect(niceCeil(86)).toBe(100);
		expect(niceCeil(0)).toBe(1);
	});

	it('keeps later data and selection pushes instantaneous', () => {
		const option = buildRadialOption({
			categories: ['alpha'],
			values: [40],
			config: { alpha: { label: 'Alpha' } },
			radialBar: {
				dataKey: 'value',
				cornerRadius: 5,
				barSize: 14,
				showBackground: true,
				isClickable: true
			},
			variant: 'full',
			innerRadius: '30%',
			outerRadius: '100%',
			angleMax: 100,
			selectedBar: null,
			tooltip: undefined,
			isLoading: false,
			loadingData: [50, 60, 70, 80, 90],
			resolved,
			animation: true,
			reducedMotion: false
		});

		expect(option.animationDurationUpdate).toBe(0);
		expect(asArray(option.series)[0]).toMatchObject({ animationDurationUpdate: 0 });
	});

	it('does not let the option escape hatch override the reveal lifecycle', () => {
		expect(
			mergeRadialChartOptions(
				{ animation: true, animationDuration: 1000, animationDurationUpdate: 0 },
				{ animation: false, animationDuration: 50, animationDurationUpdate: 50, darkMode: true }
			)
		).toMatchObject({
			animation: true,
			animationDuration: 1000,
			animationDurationUpdate: 0,
			darkMode: true
		});
	});
});
