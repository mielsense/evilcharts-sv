import { describe, expect, test } from 'vitest';
import { buildAreaOption, createAreaLoadingData, type AreaOptionContext } from './option.js';

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

	test('adds an unfiltered mini chart and data zoom when Brush is present', () => {
		const option = buildAreaOption(context({ brush: { height: 48 }, stackType: 'default' }));

		expect(Array.isArray(option.grid)).toBe(true);
		expect((option.dataZoom as unknown[])?.length).toBe(2);
		expect(
			(option.series as Array<{ id?: string }>).some((entry) => entry.id === '__mini-desktop')
		).toBe(true);
	});

	test('routes dither rendering through the ordered-pattern paint path', () => {
		const option = buildAreaOption(context({ renderStyle: 'dither', ditherVariant: 'hatched' }));
		const area = (option.series as Array<{ id?: string; areaStyle?: { color?: unknown } }>).find(
			(entry) => entry.id === 'desktop'
		);
		expect(area?.areaStyle?.color).toBe('rgba(20, 100, 220, 1)');
	});

	test('builds a muted continuation and a clipped foreground for hover reveal', () => {
		const option = buildAreaOption(
			context({ enableHoverReveal: true, hoverRevealIndex: 0, stackType: 'default' })
		);
		const series = option.series as Array<{ id?: string; data?: unknown[] }>;
		expect(series.some((entry) => entry.id === '__reveal-base-desktop')).toBe(true);
		expect(series.find((entry) => entry.id === 'desktop')?.data).toEqual([30, null]);
	});
});
