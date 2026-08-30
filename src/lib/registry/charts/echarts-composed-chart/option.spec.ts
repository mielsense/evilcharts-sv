import { describe, expect, test } from 'vitest';
import {
	buildComposedOption,
	createComposedLoadingData,
	type ComposedOptionContext
} from './option.js';

const context: ComposedOptionContext = {
	data: [
		{ month: 'Jan', desktop: 30, trend: 42 },
		{ month: 'Feb', desktop: 45, trend: 50 }
	],
	config: { desktop: { label: 'Desktop' }, trend: { label: 'Trend' } },
	bars: [
		{
			dataKey: 'desktop',
			variant: 'default',
			radius: 2,
			glow: false,
			isClickable: true,
			enableHoverHighlight: false
		}
	],
	lines: [
		{
			dataKey: 'trend',
			strokeVariant: 'dashed',
			connectNulls: false,
			glow: false,
			isClickable: true,
			dotVariant: 'none',
			activeDotVariant: 'none'
		}
	],
	xDataKey: 'month',
	curveType: 'linear',
	barGap: 2,
	barCategoryGap: 8,
	selectedDataKey: null,
	xAxis: { dataKey: 'month', hideDots: false },
	yAxis: { hideDots: false },
	showGrid: true,
	brush: { height: 44 },
	brushRange: { start: 0, end: 100 },
	isLoading: false,
	loadingData: createComposedLoadingData(6),
	loadingLineData: createComposedLoadingData(6),
	resolved: {
		series: { desktop: ['rgba(20,100,220,1)'], trend: ['rgba(220,80,120,1)'] },
		tokens: {
			mutedForeground: 'rgba(120,120,120,1)',
			border: 'rgba(120,120,120,.35)',
			foreground: 'rgba(245,245,245,1)',
			background: 'rgba(0,0,0,1)'
		}
	},
	animation: false,
	animationType: 'none',
	reducedMotion: false,
	rendererSize: { width: 640, height: 320 },
	renderStyle: 'native',
	ditherVariant: 'gradient',
	ditherCellSize: 2
};

describe('buildComposedOption', () => {
	test('combines native bar and line series with brush mini-series', () => {
		const option = buildComposedOption(context);
		const series = option.series as Array<{ id?: string; type?: string }>;
		expect(series).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ id: 'desktop', type: 'bar' }),
				expect.objectContaining({ id: 'trend', type: 'line' }),
				expect.objectContaining({ id: '__mini-desktop', type: 'line' }),
				expect.objectContaining({ id: '__mini-trend', type: 'line' })
			])
		);
		expect(option.dataZoom).toHaveLength(2);
	});

	test('preserves empty and non-finite values as gaps across composed derivatives and tooltips', () => {
		const data = [
			{ month: 'Jan', desktop: 10, trend: 2 },
			{ month: 'Feb', desktop: null, trend: null },
			{ month: 'Mar' },
			{ month: 'Apr', desktop: Number.POSITIVE_INFINITY, trend: Number.POSITIVE_INFINITY },
			{ month: 'May', desktop: Number.NaN, trend: Number.NaN },
			{ month: 'Jun', desktop: 0, trend: 0 }
		];
		const option = buildComposedOption({
			...context,
			data,
			lines: context.lines.map((line) => ({ ...line, connectNulls: true, glow: true })),
			tooltip: { variant: 'default', roundness: 'lg', position: 'variable' }
		});
		const series = option.series as Array<{ id?: string; data?: unknown[] }>;
		const values = (id: string) =>
			series
				.find((entry) => entry.id === id)
				?.data?.map((datum) =>
					datum && typeof datum === 'object' && 'value' in datum
						? (datum as { value: unknown }).value
						: datum
				);
		const expectedTrend = [2, null, null, null, null, 0];
		const expectedDesktop = [10, null, null, null, null, 0];

		expect(values('trend')).toEqual(expectedTrend);
		expect(values('__glow-trend-0')).toEqual(expectedTrend);
		expect(values('__mini-trend')).toEqual(expectedTrend);
		expect(values('desktop')).toEqual(expectedDesktop);
		expect(values('__mini-desktop')).toEqual(expectedDesktop);

		const formatter = (option.tooltip as { formatter?: (params: unknown) => string }).formatter;
		const html = formatter?.([
			{ seriesId: 'desktop', seriesName: 'Desktop', axisValueLabel: 'Feb', value: 10 },
			{ seriesId: 'trend', seriesName: 'Trend', axisValueLabel: 'Feb', value: null }
		]);
		expect(html).toContain('Desktop');
		expect(html).not.toContain('Trend');
	});

	test('uses ordered-dither paints for both geometry families', () => {
		const option = buildComposedOption({
			...context,
			renderStyle: 'dither',
			ditherVariant: 'solid'
		});
		const series = option.series as Array<{
			id?: string;
			itemStyle?: { color?: unknown };
			lineStyle?: { color?: unknown };
		}>;
		expect(series.find((entry) => entry.id === 'desktop')?.itemStyle?.color).toBe(
			'rgba(20,100,220,1)'
		);
		expect(series.find((entry) => entry.id === 'trend')?.lineStyle?.color).toBe(
			'rgba(220,80,120,1)'
		);
	});

	test('keeps animated dashed line strokes native in dither mode', () => {
		const option = buildComposedOption({
			...context,
			renderStyle: 'dither',
			ditherCellSize: 2,
			lines: context.lines.map((line) => ({ ...line, strokeVariant: 'animated-dashed' }))
		});
		const line = (option.series as Array<{ id?: string; lineStyle?: { type?: unknown } }>).find(
			(entry) => entry.id === 'trend'
		);
		expect(line?.lineStyle?.type).toEqual([5, 5]);
	});

	test('applies aura bloom to both dither geometry families', () => {
		const option = buildComposedOption({
			...context,
			brush: undefined,
			renderStyle: 'dither',
			bloom: 'aura'
		});
		const series = option.series as Array<{
			id?: string;
			itemStyle?: { shadowBlur?: number };
			lineStyle?: { shadowBlur?: number };
		}>;
		expect(series.find((entry) => entry.id === 'desktop')?.itemStyle?.shadowBlur).toBe(14);
		expect(series.find((entry) => entry.id === 'trend')?.lineStyle?.shadowBlur).toBe(14);
	});

	test('bands the category axis when bars are present and applies family-specific selection dimming', () => {
		const option = buildComposedOption({ ...context, selectedDataKey: 'trend', brush: undefined });
		const xAxis = option.xAxis as { boundaryGap?: boolean };
		const series = option.series as Array<{
			id?: string;
			itemStyle?: { opacity?: number };
			lineStyle?: { opacity?: number };
		}>;
		expect(xAxis.boundaryGap).toBe(true);
		expect(series.find((entry) => entry.id === 'desktop')?.itemStyle?.opacity).toBe(0.15);
		expect(series.find((entry) => entry.id === 'trend')?.lineStyle?.opacity).toBe(1);
	});

	test('samples multi-color bar glow per datum', () => {
		const option = buildComposedOption({
			...context,
			brush: undefined,
			bars: context.bars.map((bar) => ({ ...bar, glow: true })),
			resolved: {
				...context.resolved,
				series: {
					...context.resolved.series,
					desktop: ['rgba(20,100,220,1)', 'rgba(220,80,120,1)']
				}
			}
		});
		const bar = (
			option.series as Array<{
				id?: string;
				data?: Array<{ itemStyle?: { shadowColor?: string } }>;
			}>
		).find((entry) => entry.id === 'desktop');
		expect(bar?.data?.[0]?.itemStyle?.shadowColor).not.toBe(bar?.data?.[1]?.itemStyle?.shadowColor);
	});
});
