import { describe, expect, test } from 'vitest';
import { buildLineOption, createLineLoadingData, type LineOptionContext } from './option.js';

const resolved = {
	series: { desktop: ['rgba(20, 100, 220, 1)'] },
	tokens: {
		mutedForeground: 'rgba(120, 120, 120, 1)',
		border: 'rgba(120, 120, 120, 0.35)',
		foreground: 'rgba(245, 245, 245, 1)',
		background: 'rgba(0, 0, 0, 1)'
	}
};

function context(overrides: Partial<LineOptionContext> = {}): LineOptionContext {
	return {
		data: [
			{ month: 'Jan', desktop: 30 },
			{ month: 'Feb', desktop: 52 },
			{ month: 'Mar', desktop: 41 }
		],
		config: { desktop: { label: 'Desktop', colors: { light: ['#1464dc'] } } },
		lines: [
			{
				dataKey: 'desktop',
				strokeVariant: 'solid',
				strokeWidth: 0.8,
				connectNulls: false,
				isClickable: true,
				glowing: false,
				enableBufferLine: false,
				dotVariant: 'none',
				activeDotVariant: 'none'
			}
		],
		xDataKey: 'month',
		curveType: 'linear',
		selectedDataKey: null,
		enableHoverHighlight: false,
		enableHoverReveal: false,
		hoverRevealIndex: null,
		xAxis: { dataKey: 'month', hideDots: false },
		yAxis: { hideDots: false },
		showGrid: true,
		brushRange: { start: 0, end: 100 },
		isLoading: false,
		loadingData: createLineLoadingData(8),
		resolved,
		animation: false,
		animationType: 'none',
		reducedMotion: false,
		renderStyle: 'native',
		ditherVariant: 'gradient',
		ditherCellSize: 2,
		...overrides
	};
}

describe('buildLineOption', () => {
	test('keeps full geometry while hover reveal colors only the leading segment', () => {
		const option = buildLineOption(
			context({ enableHoverReveal: true, hoverRevealIndex: 1 })
		);
		const series = option.series as Array<{ id?: string; data?: unknown[] }>;

		expect(series.find((entry) => entry.id === '__reveal-base-desktop')?.data).toEqual([
			30,
			52,
			41
		]);
		expect(series.find((entry) => entry.id === 'desktop')?.data).toMatchObject([
			{ value: 30 },
			{ value: 52 },
			null
		]);
	});

	test('adds the native data zoom and mini series when Brush is present', () => {
		const option = buildLineOption(context({ brush: { height: 48 } }));
		expect((option.dataZoom as unknown[])?.length).toBe(2);
		expect(
			(option.series as Array<{ id?: string }>).some((entry) => entry.id === '__mini-desktop')
		).toBe(true);
	});
});
