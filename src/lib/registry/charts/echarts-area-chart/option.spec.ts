import { describe, expect, test } from 'vitest';
import {
	buildAreaOption,
	computeAreaPlottedTops,
	createAreaLoadingData,
	resolveAreaAtPixel,
	type AreaOptionContext
} from './option.js';

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

function context(overrides: Partial<AreaOptionContext> = {}): AreaOptionContext {
	return {
		data: [
			{ month: 'Jan', desktop: 30, mobile: 70 },
			{ month: 'Feb', desktop: 20, mobile: 20 }
		],
		config: {
			desktop: { label: 'Desktop', colors: { light: ['#1464dc'] } },
			mobile: { label: 'Mobile', colors: { light: ['#dc5078'] } }
		},
		areas: [
			{
				dataKey: 'desktop',
				variant: 'gradient',
				strokeVariant: 'dashed',
				strokeWidth: 0.8,
				connectNulls: false,
				isClickable: true,
				enableBufferLine: false,
				dotVariant: 'none',
				activeDotVariant: 'none'
			},
			{
				dataKey: 'mobile',
				variant: 'solid',
				strokeVariant: 'solid',
				strokeWidth: 1,
				connectNulls: false,
				isClickable: true,
				enableBufferLine: false,
				dotVariant: 'none',
				activeDotVariant: 'none'
			}
		],
		xDataKey: 'month',
		curveType: 'linear',
		stackType: 'expanded',
		selectedDataKey: null,
		enableHoverHighlight: false,
		enableHoverReveal: false,
		hoverRevealIndex: null,
		xAxis: { dataKey: 'month', hideDots: false },
		yAxis: { hideDots: false },
		showGrid: true,
		brushRange: { start: 0, end: 100 },
		isLoading: false,
		loadingData: createAreaLoadingData(8),
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

describe('buildAreaOption', () => {
	test('normalizes expanded stacks and fixes the value axis at one', () => {
		const option = buildAreaOption(context());
		const series = option.series as Array<{
			id?: string;
			data?: Array<number | { value?: number }>;
		}>;
		const yAxis = option.yAxis as {
			max?: number;
			axisLabel?: { formatter?: (value: number) => string };
		};

		expect(series.find((entry) => entry.id === 'desktop')?.data).toEqual([0.3, 0.5]);
		expect(series.find((entry) => entry.id === 'mobile')?.data).toEqual([0.7, 0.5]);
		expect(yAxis.max).toBe(1);
		expect(yAxis.axisLabel?.formatter?.(0.35)).toBe('35%');
	});

	test('preserves empty and non-finite values as gaps across area derivatives', () => {
		const data = [
			{ month: 'Jan', desktop: 10, mobile: 10 },
			{ month: 'Feb', desktop: null, mobile: 10 },
			{ month: 'Mar', mobile: 10 },
			{ month: 'Apr', desktop: Number.POSITIVE_INFINITY, mobile: 10 },
			{ month: 'May', desktop: Number.NaN, mobile: 10 },
			{ month: 'Jun', desktop: 0, mobile: 10 },
			{ month: 'Jul', desktop: 5, mobile: 10 }
		];
		const areas = context().areas.map((area, index) =>
			index === 0 ? { ...area, connectNulls: true, enableBufferLine: true } : area
		);
		const option = buildAreaOption(context({ data, areas, brush: { height: 48 } }));
		const series = option.series as Array<{ id?: string; data?: unknown[] }>;
		const tops = computeAreaPlottedTops(context({ data, areas }));

		expect(series.find((entry) => entry.id === 'desktop')?.data).toEqual([
			0.5,
			null,
			null,
			null,
			null,
			0,
			null
		]);
		expect(series.find((entry) => entry.id === '__buffer-desktop')?.data).toEqual([
			null,
			null,
			null,
			null,
			null,
			0,
			1 / 3
		]);
		expect(series.find((entry) => entry.id === '__bufferfill-desktop')?.data).toEqual([
			null,
			null,
			null,
			null,
			null,
			0,
			1 / 3
		]);
		expect(series.find((entry) => entry.id === '__mini-desktop')?.data).toEqual([
			10,
			null,
			null,
			null,
			null,
			0,
			5
		]);
		expect(tops.desktop).toEqual([0.5, null, null, null, null, 0, 1 / 3]);

		const revealed = buildAreaOption(
			context({
				data,
				areas: areas.map((area) => ({ ...area, enableBufferLine: false })),
				enableHoverReveal: true,
				hoverRevealIndex: 4
			})
		).series as Array<{ id?: string; data?: unknown[] }>;
		expect(revealed.find((entry) => entry.id === 'desktop')?.data).toEqual([
			0.5,
			null,
			null,
			null,
			null,
			null,
			null
		]);
		expect(revealed.find((entry) => entry.id === '__reveal-desktop')?.data).toEqual([
			null,
			null,
			null,
			null,
			null,
			0,
			1 / 3
		]);
	});

	test('does not hit-test an area at a gap', () => {
		const chart = {
			containPixel: () => true,
			convertFromPixel: () => [1, 0],
			convertToPixel: (_finder: unknown, point: [number, number | null]) => [
				point[0],
				point[1] === null ? 50 : 100
			]
		} as unknown as Parameters<typeof resolveAreaAtPixel>[0];

		expect(
			resolveAreaAtPixel(
				chart,
				{ desktop: [1, null], mobile: [1, 1] },
				['desktop', 'mobile'],
				0,
				50
			)
		).toBeNull();
	});

	test('adds an unfiltered mini chart and data zoom when Brush is present', () => {
		const option = buildAreaOption(context({ brush: { height: 48 }, stackType: 'default' }));

		expect(Array.isArray(option.grid)).toBe(true);
		expect((option.dataZoom as unknown[])?.length).toBe(2);
		expect(
			(option.series as Array<{ id?: string }>).some((entry) => entry.id === '__mini-desktop')
		).toBe(true);
	});

	test('matches the upstream stacked, curved, fading brush preview', () => {
		const areas = context().areas.map((area, index) =>
			index === 0 ? { ...area, curveType: 'bump' as const, connectNulls: true } : area
		);
		const option = buildAreaOption(context({ brush: { height: 48 }, stackType: 'stacked', areas }));
		const grids = option.grid as Array<{ outerBoundsMode?: string }>;
		const mini = (option.series as Array<Record<string, unknown>>).find(
			(entry) => entry.id === '__mini-desktop'
		) as {
			stack?: string;
			smooth?: boolean;
			step?: boolean | string;
			connectNulls?: boolean;
			areaStyle?: {
				color?: { type?: string; colorStops?: Array<{ offset: number; color: string }> };
			};
		};

		expect(grids[1]?.outerBoundsMode).toBe('none');
		expect(mini).toMatchObject({
			stack: '__mini-total',
			smooth: true,
			step: false,
			connectNulls: true
		});
		expect(mini.areaStyle?.color).toMatchObject({
			type: 'linear',
			colorStops: [
				{ offset: 0, color: 'rgba(20, 100, 220, 0.150)' },
				{ offset: 1, color: 'rgba(20, 100, 220, 0.000)' }
			]
		});
	});

	test('routes dither rendering through the ordered-pattern paint path', () => {
		const option = buildAreaOption(context({ renderStyle: 'dither', ditherVariant: 'hatched' }));
		const area = (option.series as Array<{ id?: string; areaStyle?: { color?: unknown } }>).find(
			(entry) => entry.id === 'desktop'
		);
		expect(area?.areaStyle?.color).toBe('rgba(20, 100, 220, 1)');
	});

	test('keeps animated dashed strokes native while dithering the area fill', () => {
		const areas = context().areas.map((area, index) =>
			index === 0 ? { ...area, strokeVariant: 'animated-dashed' as const } : area
		);
		const option = buildAreaOption(context({ areas, renderStyle: 'dither', ditherCellSize: 2 }));
		const area = (option.series as Array<{ id?: string; lineStyle?: { type?: unknown } }>).find(
			(entry) => entry.id === 'desktop'
		);
		expect(area?.lineStyle?.type).toEqual([3, 3]);
	});

	test('applies bloom only to dither geometry', () => {
		const dither = buildAreaOption(
			context({ renderStyle: 'dither', bloom: 'aura', stackType: 'default' })
		);
		const native = buildAreaOption(
			context({ renderStyle: 'native', bloom: 'aura', stackType: 'default' })
		);
		const shadow = (option: ReturnType<typeof buildAreaOption>) =>
			(option.series as Array<{ id?: string; lineStyle?: { shadowBlur?: number } }>).find(
				(entry) => entry.id === 'desktop'
			)?.lineStyle?.shadowBlur;
		expect(shadow(dither)).toBe(14);
		expect(shadow(native)).toBe(0);
	});

	test('builds a muted continuation and a clipped foreground for hover reveal', () => {
		const option = buildAreaOption(
			context({ enableHoverReveal: true, hoverRevealIndex: 0, stackType: 'default' })
		);
		const series = option.series as Array<{ id?: string; data?: unknown[] }>;
		expect(series.some((entry) => entry.id === '__reveal-desktop')).toBe(true);
		expect(series.find((entry) => entry.id === 'desktop')?.data).toEqual([30, null]);
	});

	test('keeps buffer fill, endpoint markers, and the final tooltip value', () => {
		const areas = context().areas.map((area, index) =>
			index === 0
				? {
						...area,
						enableBufferLine: true,
						dotVariant: 'default' as const,
						activeDotVariant: 'colored-border' as const
					}
				: area
		);
		const option = buildAreaOption(
			context({
				areas,
				stackType: 'default',
				tooltip: { variant: 'default', roundness: 'lg', cursor: true, position: 'variable' }
			})
		);
		const series = option.series as Array<{ id?: string; showSymbol?: boolean }>;
		expect(series.find((entry) => entry.id === '__buffer-desktop')?.showSymbol).toBe(true);
		expect(series.some((entry) => entry.id === '__bufferfill-desktop')).toBe(true);

		const formatter = (option.tooltip as { formatter?: (value: unknown) => string }).formatter;
		const html = formatter?.([
			{ seriesId: 'desktop', seriesName: 'Desktop', axisValueLabel: 'Feb', value: null },
			{ seriesId: '__buffer-desktop', axisValueLabel: 'Feb', value: 20 }
		]);
		expect(html).toContain('Desktop');
		expect(html).toContain('20');
	});
});
