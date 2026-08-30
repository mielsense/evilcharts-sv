import { describe, expect, it, vi } from 'vitest';
import type { ResolvedColors } from '../../ui/echarts-chart/index.js';
import { buildPieOption, createPieLoadingFrame } from './option.js';

const resolved: ResolvedColors = {
	series: {
		chrome: ['rgba(4, 120, 87, 1)'],
		safari: ['rgba(3, 105, 161, 1)', 'rgba(56, 189, 248, 1)']
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
		{ browser: 'chrome', visitors: 46, share: '46%' },
		{ browser: 'safari', visitors: 28, share: '28%' }
	],
	config: {
		chrome: { label: 'Chrome', colors: { light: ['#047857'] } },
		safari: { label: 'Safari', colors: { light: ['#0369a1', '#38bdf8'] } }
	},
	dataKey: 'visitors',
	nameKey: 'browser',
	pie: {
		variant: 'gradient' as const,
		innerRadius: 24,
		outerRadius: '80%',
		cornerRadius: 4,
		paddingAngle: 3,
		startAngle: 90,
		endAngle: -270,
		isClickable: true,
		labelDataKey: 'share',
		labelPosition: 'inside' as const
	},
	selectedSector: 'safari',
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
	resolved,
	animation: true,
	reducedMotion: false
};

describe('buildPieOption', () => {
	it('maps rows, geometry, labels, and controlled selection into one pie series', () => {
		const option = buildPieOption({ ...base, isLoading: false });
		const series = (option.series as Array<Record<string, unknown>>)[0];
		const sectors = series.data as Array<Record<string, unknown>>;

		expect(option.aria).toEqual({ enabled: true });
		expect(series).toMatchObject({
			id: 'pie',
			type: 'pie',
			center: ['50%', '45%'],
			radius: [24, '80%'],
			startAngle: 90,
			endAngle: -270,
			clockwise: false,
			selectedMode: 'single'
		});
		expect(sectors.map(({ name, value, selected }) => ({ name, value, selected }))).toEqual([
			{ name: 'chrome', value: 46, selected: false },
			{ name: 'safari', value: 28, selected: true }
		]);
		expect((series.label as { show: boolean }).show).toBe(true);
		expect((option.tooltip as { show: boolean }).show).toBe(true);
	});

	it('replaces data with the reference five-sector loading ring', () => {
		const option = buildPieOption({ ...base, isLoading: true });
		const series = (option.series as Array<Record<string, unknown>>)[0];

		expect(series).toMatchObject({ id: '__loading', type: 'pie', silent: true });
		expect(series.data).toHaveLength(5);
		expect(option.tooltip).toEqual({ show: false });
	});

	it('preserves loading geometry styles while sweeping the reference highlight window', () => {
		const frame = createPieLoadingFrame({
			center: 0.1,
			foreground: 'rgba(20, 20, 20, 1)',
			background: 'rgba(255, 255, 255, 1)',
			cornerRadius: 4,
			paddingAngle: 3
		});

		expect(frame).toHaveLength(5);
		expect(frame[0]).toMatchObject({
			name: '__loading-0',
			value: 1,
			itemStyle: {
				color: 'rgba(20, 20, 20, 0.500)',
				opacity: 1,
				borderRadius: 4,
				borderColor: 'rgba(255, 255, 255, 1)',
				borderWidth: 3
			}
		});
		expect(frame[2].itemStyle.color).toBe('rgba(20, 20, 20, 0.150)');
	});

	it('switches sector paint to the ordered-dither pipeline', () => {
		const option = buildPieOption({
			...base,
			isLoading: false,
			renderStyle: 'dither',
			resolved: {
				...resolved,
				series: {
					...resolved.series,
					chrome: ['rgba(4, 120, 87, 1)', 'rgba(16, 185, 129, 1)']
				}
			}
		});
		const series = (option.series as Array<Record<string, unknown>>)[0];
		const sectors = series.data as Array<{ itemStyle: { color: unknown } }>;

		expect(sectors[0].itemStyle.color).toBe('rgba(4, 120, 87, 1)');
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
			const option = buildPieOption({
				...base,
				isLoading: false,
				renderStyle: 'dither',
				ditherCellSize: 3,
				rendererSize: { width: 320, height: 200 }
			});
			const series = (option.series as Array<Record<string, unknown>>)[0];
			const sectors = series.data as Array<{ itemStyle: { color: unknown } }>;

			expect(sectors[0].itemStyle.color).toMatchObject({
				image: canvas,
				repeat: 'repeat-x',
				imageWidth: 12,
				imageHeight: 162,
				y: 10
			});
		} finally {
			vi.unstubAllGlobals();
		}
	});
});
