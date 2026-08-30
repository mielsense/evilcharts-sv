import { describe, expect, test } from 'vitest';
import { buildBarOption, createBarLoadingData, type BarOptionContext } from './option.js';

const resolved = {
	series: {
		desktop: ['rgba(20, 100, 220, 1)'],
		mobile: ['rgba(220, 80, 120, 1)']
	},
	tokens: {
		mutedForeground: 'rgba(120, 120, 120, 1)',
		border: 'rgba(120, 120, 120, 0.35)',
		foreground: 'rgba(245, 245, 245, 1)',
		background: 'rgba(0, 0, 0, 1)'
	}
};

function context(overrides: Partial<BarOptionContext> = {}): BarOptionContext {
	return {
		data: [
			{ month: 'Jan', desktop: 30, mobile: 70 },
			{ month: 'Feb', desktop: 20, mobile: 20 }
		],
		config: {
			desktop: { label: 'Desktop', colors: { light: ['#1464dc'] } },
			mobile: { label: 'Mobile', colors: { light: ['#dc5078'] } }
		},
		bars: [
			{
				dataKey: 'desktop',
				variant: 'default',
				radius: 2,
				isClickable: true,
				enableHoverHighlight: false,
				glowing: false,
				bufferBar: false
			},
			{
				dataKey: 'mobile',
				variant: 'default',
				radius: 2,
				isClickable: true,
				enableHoverHighlight: false,
				glowing: false,
				bufferBar: false
			}
		],
		xDataKey: 'month',
		stackType: 'percent',
		layout: 'vertical',
		barRadius: 2,
		selectedDataKey: null,
		enableMaxValueHighlight: false,
		xAxis: { dataKey: 'month', hideDots: false },
		yAxis: { hideDots: false },
		showGrid: true,
		brushRange: { start: 0, end: 100 },
		isLoading: false,
		loadingData: createBarLoadingData(8),
		resolved,
		animation: false,
		animationType: 'none',
		reducedMotion: false,
		rendererSize: { width: 640, height: 320 },
		renderStyle: 'native',
		ditherVariant: 'gradient',
		ditherCellSize: 2,
		...overrides
	};
}

describe('buildBarOption', () => {
	test('normalizes percent stacks and fixes the value axis at one', () => {
		const option = buildBarOption(context());
		const series = option.series as Array<{ id?: string; data?: number[] }>;
		const yAxis = option.yAxis as {
			max?: number;
			axisLabel?: { formatter?: (value: number) => string };
		};

		expect(series.find((entry) => entry.id === 'desktop')?.data).toEqual([0.3, 0.5]);
		expect(series.find((entry) => entry.id === 'mobile')?.data).toEqual([0.7, 0.5]);
		expect(yAxis.max).toBe(1);
		expect(yAxis.axisLabel?.formatter?.(0.35)).toBe('35%');
	});

	test('swaps category and value axes for horizontal layout and omits the brush', () => {
		const option = buildBarOption(
			context({ layout: 'horizontal', stackType: 'default', brush: { height: 48 } })
		);
		const xAxis = option.xAxis as { type?: string };
		const yAxis = option.yAxis as { type?: string; inverse?: boolean };

		expect(xAxis.type).toBe('value');
		expect(yAxis.type).toBe('category');
		expect(yAxis.inverse).toBe(true);
		expect(option.dataZoom).toBeUndefined();
	});

	test('routes dither rendering through the ordered-pattern paint path', () => {
		const option = buildBarOption(context({ renderStyle: 'dither', ditherVariant: 'dotted' }));
		const bar = (option.series as Array<{ id?: string; itemStyle?: { color?: unknown } }>).find(
			(entry) => entry.id === 'desktop'
		);
		expect(bar?.itemStyle?.color).toBe('rgba(20, 100, 220, 1)');
	});

	test('applies low bloom only in dither mode', () => {
		const dither = buildBarOption(context({ renderStyle: 'dither', bloom: 'low' }));
		const native = buildBarOption(context({ renderStyle: 'native', bloom: 'low' }));
		const shadow = (option: ReturnType<typeof buildBarOption>) =>
			(option.series as Array<{ id?: string; itemStyle?: { shadowBlur?: number } }>).find(
				(entry) => entry.id === 'desktop'
			)?.itemStyle?.shadowBlur;
		expect(shadow(dither)).toBe(4);
		expect(shadow(native)).toBe(0);
	});

	test('highlights only the first tallest column and gives it the glow', () => {
		const option = buildBarOption(context({ enableMaxValueHighlight: true }));
		const bar = (
			option.series as Array<{
				id?: string;
				data?: Array<{ itemStyle?: { color?: string; shadowBlur?: number } }>;
			}>
		).find((entry) => entry.id === 'desktop');
		expect(bar?.data?.[0]?.itemStyle?.shadowBlur).toBe(18);
		expect(bar?.data?.[1]?.itemStyle?.color).toContain('0.160');
	});

	test('rounds only the value-end corners of horizontal stripped bars', () => {
		const stripped = context({ layout: 'horizontal', stackType: 'default' });
		stripped.bars = [{ ...stripped.bars[0], variant: 'stripped', radius: 3 }];
		const option = buildBarOption(stripped);
		const bar = (option.series as Array<{ itemStyle?: { borderRadius?: unknown } }>)[0];
		expect(bar.itemStyle?.borderRadius).toEqual([0, 3, 3, 0]);
	});

	test('renders an isometric bar as a custom cartesian series', () => {
		const isometric = context({ stackType: 'default', enableMaxValueHighlight: true });
		isometric.bars = [{ ...isometric.bars[0], variant: 'isometric' }];
		const option = buildBarOption(isometric);
		const series = (option.series as Array<{ type?: string; coordinateSystem?: string }>)[0];

		expect(series.type).toBe('custom');
		expect(series.coordinateSystem).toBe('cartesian2d');
	});

	test('attaches a formatted reference line to the first regular bar series', () => {
		const option = buildBarOption(
			context({
				stackType: 'default',
				referenceLine: 42,
				referenceLineFormatter: (value) => `Median ${value}`
			})
		);
		const series = option.series as Array<{
			markLine?: { data?: Array<{ yAxis?: number }>; label?: { formatter?: string } };
		}>;

		expect(series[0].markLine?.data).toEqual([{ yAxis: 42 }]);
		expect(series[0].markLine?.label?.formatter).toBe('Median 42');
		expect(series[1].markLine).toBeUndefined();
	});
});
