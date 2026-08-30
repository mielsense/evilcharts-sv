import { describe, expect, it, vi } from 'vitest';
import type { ResolvedColors } from '../../ui/echarts-chart/index.js';
import { buildRadarOption, createRadarLoadingData, createRadarShimmerStops } from './option.js';

const resolved: ResolvedColors = {
	series: {
		desktop: ['rgba(4, 120, 87, 1)'],
		mobile: ['rgba(190, 18, 60, 1)']
	},
	tokens: {
		mutedForeground: 'rgba(100, 100, 100, 1)',
		border: 'rgba(120, 120, 120, 0.3)',
		foreground: 'rgba(20, 20, 20, 1)',
		background: 'rgba(255, 255, 255, 1)'
	}
};

const base = {
	data: [
		{ skill: 'JS', desktop: 80, mobile: 48 },
		{ skill: 'TS', desktop: 96, mobile: 70 },
		{ skill: 'Svelte', desktop: 88, mobile: 76 }
	],
	config: {
		desktop: { label: 'Desktop', colors: { light: ['#047857'] } },
		mobile: { label: 'Mobile', colors: { light: ['#be123c'] } }
	},
	radars: [
		{
			dataKey: 'desktop',
			variant: 'filled' as const,
			fillOpacity: 0.4,
			isClickable: true,
			dotVariant: 'border' as const,
			activeDotVariant: 'colored-border' as const
		},
		{
			dataKey: 'mobile',
			variant: 'lines' as const,
			fillOpacity: 0.4,
			isClickable: true,
			dotVariant: 'none' as const,
			activeDotVariant: 'none' as const
		}
	],
	angleAxis: { dataKey: 'skill' },
	radiusAxis: true,
	grid: { gridType: 'circle' as const },
	tooltip: {
		variant: 'default' as const,
		roundness: 'lg' as const,
		position: 'variable' as const
	},
	legend: {
		variant: 'rounded-square' as const,
		align: 'center' as const,
		verticalAlign: 'bottom' as const,
		isClickable: true
	},
	selectedDataKey: 'desktop',
	resolved,
	animation: true,
	reducedMotion: false,
	loadingPoints: 6,
	loadingData: createRadarLoadingData(6)
};

describe('buildRadarOption', () => {
	it('maps categories, shared maxima, grid shape, and each registered radar', () => {
		const option = buildRadarOption({ ...base, isLoading: false });
		const radar = option.radar as Record<string, unknown>;
		const series = option.series as Array<Record<string, unknown>>;

		expect(option.aria).toEqual({ enabled: true });
		expect(radar).toMatchObject({ center: ['50%', '46%'], shape: 'circle' });
		expect(radar.indicator).toEqual([
			{ name: 'JS', max: 96 },
			{ name: 'TS', max: 96 },
			{ name: 'Svelte', max: 96 }
		]);
		expect(series.map(({ id, name }) => ({ id, name }))).toEqual([
			{ id: 'desktop', name: 'Desktop' },
			{ id: 'mobile', name: 'Mobile' }
		]);
		expect((series[0].data as Array<{ value: number[] }>)[0].value).toEqual([80, 96, 88]);
		expect(series[1].areaStyle).toBeUndefined();
	});

	it('applies per-series dashed strokes and glow without changing radar geometry', () => {
		const option = buildRadarOption({
			...base,
			isLoading: false,
			radars: [
				{ ...base.radars[0], glowing: true },
				{ ...base.radars[1], strokeVariant: 'dashed' as const }
			]
		});
		const series = option.series as Array<{
			lineStyle?: { type?: string; shadowBlur?: number };
		}>;

		expect(series[0].lineStyle).toMatchObject({ type: 'solid', shadowBlur: 8 });
		expect(series[1].lineStyle).toMatchObject({ type: 'dashed', shadowBlur: 0 });
	});

	it('renders the reference random-walk loading polygon with the requested point count', () => {
		const loadingData = createRadarLoadingData(8, () => 0.5);
		const option = buildRadarOption({
			...base,
			isLoading: true,
			loadingPoints: 8,
			loadingData
		});
		const series = (option.series as Array<Record<string, unknown>>)[0];

		expect(loadingData).toEqual([58, 58, 58, 58, 58, 58, 58, 58]);
		expect(series).toMatchObject({ id: '__loading', type: 'radar', silent: true });
		expect((series.data as Array<{ value: number[] }>)[0].value).toHaveLength(8);
		expect(option.tooltip).toEqual({ show: false });
	});

	it('builds the clipped loading window used by both radar stroke and fill', () => {
		const stops = createRadarShimmerStops(0.5, 'rgba(20, 20, 20, 1)', 0.5);
		expect(stops.map((stop) => Number(stop.offset.toFixed(2)))).toEqual([0, 0.3, 0.5, 0.7, 1]);
		expect(stops.map((stop) => stop.color)).toEqual([
			'rgba(20, 20, 20, 0.000)',
			'rgba(20, 20, 20, 0.000)',
			'rgba(20, 20, 20, 0.500)',
			'rgba(20, 20, 20, 0.000)',
			'rgba(20, 20, 20, 0.000)'
		]);
	});

	it('switches filled radar paint to the ordered-dither pipeline', () => {
		const option = buildRadarOption({
			...base,
			isLoading: false,
			renderStyle: 'dither',
			resolved: {
				...resolved,
				series: {
					...resolved.series,
					desktop: ['rgba(4, 120, 87, 1)', 'rgba(16, 185, 129, 1)']
				}
			}
		});
		const series = (option.series as Array<Record<string, unknown>>)[0];
		const areaStyle = series.areaStyle as { color: unknown };

		expect(areaStyle.color).toBe('rgba(4, 120, 87, 1)');
	});

	it('provides explicit tile dimensions for canvas and SVG dither renderers', () => {
		const canvas = {
			width: 0,
			height: 0,
			toDataURL: () => 'data:image/png;base64,dither',
			getContext: () => ({
				clearRect: vi.fn(),
				fillRect: vi.fn(),
				globalAlpha: 1,
				fillStyle: ''
			})
		};
		vi.stubGlobal('document', { createElement: () => canvas });
		try {
			const option = buildRadarOption({
				...base,
				isLoading: false,
				renderStyle: 'dither',
				ditherCellSize: 3,
				rendererSize: { width: 320, height: 200 }
			});
			const series = (option.series as Array<Record<string, unknown>>)[0];
			const areaStyle = series.areaStyle as { color: unknown };

			expect(areaStyle.color).toMatchObject({
				image: canvas,
				repeat: 'repeat-x',
				imageWidth: 12,
				imageHeight: 138,
				y: 24
			});
		} finally {
			vi.unstubAllGlobals();
		}
	});
});
