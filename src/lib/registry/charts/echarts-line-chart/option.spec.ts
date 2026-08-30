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
	test('splits hover reveal into a colored head and a muted tail', () => {
		const option = buildLineOption(context({ enableHoverReveal: true, hoverRevealIndex: 1 }));
		const series = option.series as Array<{ id?: string; data?: unknown[] }>;

		expect(series.find((entry) => entry.id === '__reveal-base-desktop')?.data).toEqual([
			null,
			52,
			41
		]);
		expect(series.find((entry) => entry.id === 'desktop')?.data).toEqual([30, 52, null]);
	});

	test('adds the native data zoom and mini series when Brush is present', () => {
		const option = buildLineOption(context({ brush: { height: 48 } }));
		expect((option.dataZoom as unknown[])?.length).toBe(2);
		expect(
			(option.series as Array<{ id?: string }>).some((entry) => entry.id === '__mini-desktop')
		).toBe(true);
	});

	test('lets hover reveal take precedence over glow and buffer rendering', () => {
		const line = {
			...context().lines[0],
			strokeVariant: 'dashed' as const,
			glowing: true,
			enableBufferLine: true
		};
		const option = buildLineOption(
			context({ lines: [line], enableHoverReveal: true, hoverRevealIndex: 1 })
		);
		const series = option.series as Array<{
			id?: string;
			lineStyle?: { type?: unknown; shadowBlur?: number };
		}>;

		expect(series.map((entry) => entry.id)).toEqual(['__reveal-base-desktop', 'desktop']);
		expect(series.find((entry) => entry.id === 'desktop')?.lineStyle).toMatchObject({
			type: [3, 3]
		});
		expect(series.find((entry) => entry.id === 'desktop')?.lineStyle?.shadowBlur).toBeUndefined();
	});

	test('renders a solid body and connected dashed tail for a buffer line', () => {
		const line = {
			...context().lines[0],
			strokeVariant: 'dashed' as const,
			enableBufferLine: true,
			dotVariant: 'default' as const
		};
		const option = buildLineOption(context({ lines: [line] }));
		const series = option.series as Array<{
			id?: string;
			animation?: boolean;
			connectNulls?: boolean;
			showSymbol?: boolean;
			tooltip?: unknown;
			lineStyle?: { type?: unknown };
		}>;

		expect(series.find((entry) => entry.id === 'desktop')?.lineStyle?.type).toBe('solid');
		expect(series.find((entry) => entry.id === '__buffer-desktop')).toMatchObject({
			connectNulls: true,
			showSymbol: true,
			lineStyle: { type: [4, 3] }
		});
		expect(series.find((entry) => entry.id === '__buffer-desktop')?.tooltip).toBeUndefined();
		expect(series.find((entry) => entry.id === '__buffer-desktop')?.animation).toBeUndefined();
	});

	test('builds four silent glow companions beneath a glowing line', () => {
		const line = { ...context().lines[0], glowing: true, dotVariant: 'default' as const };
		const option = buildLineOption(context({ lines: [line] }));
		const series = option.series as Array<{
			id?: string;
			animation?: boolean;
			silent?: boolean;
			symbolSize?: number;
			lineStyle?: { shadowBlur?: number };
		}>;
		const glows = series.filter((entry) => entry.id?.startsWith('__glow-'));

		expect(glows.map((entry) => entry.id)).toEqual([
			'__glow-0-desktop',
			'__glow-1-desktop',
			'__glow-2-desktop',
			'__glow-3-desktop'
		]);
		expect(glows.map((entry) => entry.lineStyle?.shadowBlur)).toEqual([5, 12, 24, 42]);
		expect(glows.every((entry) => entry.silent)).toBe(true);
		expect(glows.every((entry) => entry.animation === undefined)).toBe(true);
		expect(glows[3]?.symbolSize).toBe(22);
		expect(series.find((entry) => entry.id === 'desktop')?.lineStyle?.shadowBlur).toBeUndefined();
	});

	test('uses the active dot size when resting dots are omitted', () => {
		const line = {
			...context().lines[0],
			dotVariant: 'none' as const,
			activeDotVariant: 'colored-border' as const
		};
		const option = buildLineOption(context({ lines: [line] }));
		const main = (
			option.series as Array<{
				id?: string;
				showSymbol?: boolean;
				symbolSize?: number;
			}>
		).find((entry) => entry.id === 'desktop');

		expect(main).toMatchObject({ showSymbol: false, symbolSize: 6 });
	});

	test('coerces missing and non-numeric line values to zero like the source chart', () => {
		const option = buildLineOption(
			context({
				data: [
					{ month: 'Jan', desktop: 10 },
					{ month: 'Feb', desktop: null },
					{ month: 'Mar', desktop: 'bad' }
				]
			})
		);
		const main = (
			option.series as Array<{ id?: string; data?: Array<{ value?: number } | number> }>
		).find((entry) => entry.id === 'desktop');

		expect(main?.data).toEqual([10, 0, 0]);
	});

	test('uses the raw category in the tooltip and dims rows for live hover highlight', () => {
		const secondLine = { ...context().lines[0], dataKey: 'mobile' };
		const tooltipContext = context({
			data: [
				{ month: 'January', desktop: 30, mobile: 22 },
				{ month: 'February', desktop: 52, mobile: 37 }
			],
			config: {
				desktop: { label: 'Desktop', colors: { light: ['#1464dc'] } },
				mobile: { label: 'Mobile', colors: { light: ['#dc6414'] } }
			},
			lines: [context().lines[0], secondLine],
			tooltip: { variant: 'default', roundness: 'lg', position: 'variable' }
		});
		Object.assign(tooltipContext, { getHoveredDataKey: () => 'desktop' });
		const option = buildLineOption(tooltipContext);
		const formatter = (option.tooltip as { formatter?: (params: unknown) => string }).formatter;
		const html = formatter?.([
			{
				seriesId: 'desktop',
				seriesName: 'Desktop',
				axisValue: 'January',
				axisValueLabel: 'Jan',
				value: 30
			},
			{
				seriesId: 'mobile',
				seriesName: 'Mobile',
				axisValue: 'January',
				axisValueLabel: 'Jan',
				value: 22
			}
		]);

		expect(html).toContain('January');
		expect(html).not.toContain('>Jan<');
		expect(html).toContain('Mobile');
		expect(html).toContain('opacity-30');
	});

	test('keeps the brush mini chart inert and uses the first configured color', () => {
		const gradientResolved = {
			...resolved,
			series: { desktop: ['rgba(20, 100, 220, 1)', 'rgba(220, 100, 20, 1)'] }
		};
		const option = buildLineOption(context({ brush: { height: 48 }, resolved: gradientResolved }));
		const grids = option.grid as Array<Record<string, unknown>>;
		const axes = option.xAxis as Array<Record<string, unknown>>;
		const mini = (option.series as Array<{ id?: string }>).find(
			(entry) => entry.id === '__mini-desktop'
		) as Record<string, unknown>;

		expect(grids[1]).toMatchObject({ outerBoundsMode: 'none' });
		expect(axes[1]).toMatchObject({ axisPointer: { show: false } });
		expect(mini).toMatchObject({
			z: 0,
			emphasis: { disabled: true },
			tooltip: { show: false },
			lineStyle: { color: 'rgba(20, 100, 220, 1)', opacity: 0.5 }
		});
	});

	test('honors the first line animation override at the chart option level', () => {
		const line = { ...context().lines[0], animationType: 'none' as const };
		const disabled = buildLineOption(
			context({ lines: [line], animation: true, animationType: 'left-to-right' })
		);
		const enabled = buildLineOption(
			context({
				lines: [{ ...line, animationType: undefined }],
				animation: true,
				animationType: 'left-to-right'
			})
		);

		expect(disabled.animation).toBe(false);
		expect(enabled).toMatchObject({
			animation: true,
			animationDuration: 1000,
			animationDurationUpdate: 0
		});
	});

	test('applies per-line dither texture and root bloom settings', () => {
		const line = { ...context().lines[0], ditherVariant: 'dotted' as const };
		const ditherContext = context({ lines: [line], renderStyle: 'dither' });
		Object.assign(ditherContext, { bloom: 'high' });
		const option = buildLineOption(ditherContext);
		const main = (
			option.series as Array<{
				id?: string;
				lineStyle?: { color?: unknown; shadowBlur?: number };
			}>
		).find((entry) => entry.id === 'desktop');

		expect(main?.lineStyle?.color).toBeDefined();
		expect(main?.lineStyle?.shadowBlur).toBe(8);
	});
});
