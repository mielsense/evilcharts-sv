import type { RadarSeriesOption } from 'echarts/charts';
import type { RadarComponentOption, TooltipComponentOption } from 'echarts/components';
import type { ComposeOption } from 'echarts/core';
import * as echarts from 'echarts/core';
import {
	getColorsCount,
	withAlpha,
	type ChartConfig,
	type ResolvedColors
} from '../../ui/echarts-chart/index.js';
import { dotStyle, sampleGradient } from '../../ui/echarts-dot/index.js';
import {
	createDitherPattern,
	type DitherVariant,
	type RenderStyle
} from '../../ui/echarts-dither/index.js';
import {
	escapeTooltipHtml,
	resolveTooltipPosition,
	roundnessClass,
	tooltipIndicatorHtml,
	tooltipRow,
	tooltipVariantClass
} from '../../ui/echarts-tooltip/index.js';
import {
	LOADING_MAX,
	STROKE_WIDTH,
	type DitherBloom,
	type AngleAxisRegistration,
	type GridRegistration,
	type LegendRegistration,
	type RadarRegistration,
	type TooltipRegistration
} from './types.js';

export type EChartsRadarOption = ComposeOption<
	RadarSeriesOption | RadarComponentOption | TooltipComponentOption
>;

export type RadarOptionContext = {
	data: Record<string, unknown>[];
	config: ChartConfig;
	radars: RadarRegistration[];
	angleAxis?: AngleAxisRegistration;
	radiusAxis: boolean;
	grid?: GridRegistration;
	tooltip?: TooltipRegistration;
	legend?: LegendRegistration;
	selectedDataKey: string | null;
	resolved: ResolvedColors;
	animation: boolean;
	reducedMotion: boolean;
	loadingPoints: number;
	loadingData: number[];
	isLoading: boolean;
	renderStyle?: RenderStyle;
	ditherVariant?: DitherVariant;
	ditherCellSize?: number;
	bloom?: DitherBloom;
	rendererSize?: { width: number; height: number };
};

const FALLBACK_COLOR = 'rgba(120, 120, 120, 1)';
const GRID_LINE_OPACITY = 1;
const LOADING_SHIMMER_BAND = 0.2;
const LOADING_SHIMMER_FEATHER = 0.2;

function radarDitherBounds(context: RadarOptionContext) {
	const size = context.rendererSize;
	if (!size || size.width <= 0 || size.height <= 0) return undefined;
	const radius = Math.min(size.width, size.height) * 0.34;
	const center = Number.parseFloat(radarCenterY(context.legend)) / 100;
	return { height: radius * 2, offsetY: size.height * center - radius };
}

function rendererDitherPattern(
	slots: string[],
	variant: DitherVariant,
	cellSize: number,
	context: RadarOptionContext
) {
	return createDitherPattern(slots, variant, cellSize, 1, radarDitherBounds(context));
}

export function createRadarLoadingData(points: number, random = Math.random): number[] {
	const count = Math.max(0, Math.floor(points));
	const values: number[] = [];
	let value = 45 + random() * 25;
	for (let index = 0; index < count; index += 1) {
		value = Math.min(90, Math.max(35, value + (random() - 0.5) * 35));
		values.push(Math.round(value));
	}
	return values;
}

export function createRadarShimmerStops(center: number, color: string, peak: number) {
	const alphaAt = (offset: number) => {
		const distance = Math.abs(offset - center);
		if (distance <= LOADING_SHIMMER_BAND - LOADING_SHIMMER_FEATHER) return peak;
		if (distance >= LOADING_SHIMMER_BAND) return 0;
		return (
			peak *
			Math.sin(
				((1 -
					(distance - (LOADING_SHIMMER_BAND - LOADING_SHIMMER_FEATHER)) / LOADING_SHIMMER_FEATHER) *
					Math.PI) /
					2
			)
		);
	};
	const offsets = [
		0,
		center - LOADING_SHIMMER_BAND,
		center - LOADING_SHIMMER_BAND + LOADING_SHIMMER_FEATHER,
		center,
		center + LOADING_SHIMMER_BAND - LOADING_SHIMMER_FEATHER,
		center + LOADING_SHIMMER_BAND,
		1
	]
		.filter((offset) => offset >= 0 && offset <= 1)
		.sort((left, right) => left - right);
	const stops: Array<{ offset: number; color: string }> = [];
	for (const offset of offsets) {
		if (stops.length === 0 || offset - stops[stops.length - 1].offset > 1e-4) {
			stops.push({ offset, color: withAlpha(color, alphaAt(offset)) });
		}
	}
	return stops;
}

function categoryKey(context: RadarOptionContext): string | undefined {
	if (context.angleAxis?.dataKey) return context.angleAxis.dataKey;
	const seriesKeys = new Set(context.radars.map((radar) => radar.dataKey));
	return Object.keys(context.data[0] ?? {}).find((key) => !seriesKeys.has(key));
}

function categories(context: RadarOptionContext): string[] {
	const key = categoryKey(context);
	return context.data.map((row, index) => String((key ? row[key] : undefined) ?? index));
}

function indicatorMax(context: RadarOptionContext): number {
	let maximum = 0;
	for (const radar of context.radars) {
		for (const row of context.data) maximum = Math.max(maximum, Number(row[radar.dataKey]) || 0);
	}
	return maximum || 1;
}

function radarCenterY(legend?: LegendRegistration): string {
	if (!legend) return '50%';
	if (legend.verticalAlign === 'bottom') return '46%';
	if (legend.verticalAlign === 'top') return '54%';
	return '50%';
}

function radarStrokePaint(slots: string[]): string | echarts.graphic.LinearGradient {
	if (slots.length <= 1) return slots[0] ?? FALLBACK_COLOR;
	return new echarts.graphic.LinearGradient(
		0,
		0,
		1,
		1,
		slots.map((color, index) => ({ offset: index / (slots.length - 1), color }))
	);
}

function radarFillPaint(slots: string[]): echarts.graphic.RadialGradient {
	if (slots.length <= 1) {
		const color = slots[0] ?? FALLBACK_COLOR;
		return new echarts.graphic.RadialGradient(0.5, 0.5, 0.5, [
			{ offset: 0, color: withAlpha(color, 0.8) },
			{ offset: 1, color: withAlpha(color, 0.3) }
		]);
	}
	return new echarts.graphic.RadialGradient(
		0.5,
		0.5,
		0.5,
		slots.map((color, index) => ({
			offset: index / (slots.length - 1),
			color: withAlpha(color, index === 0 ? 0.8 : 0.3)
		}))
	);
}

function bloomPixels(bloom: DitherBloom | undefined): number {
	if (bloom === 'aura') return 14;
	if (bloom === 'high') return 8;
	if (bloom === 'low') return 4;
	return 0;
}

function radarComponent(context: RadarOptionContext): RadarComponentOption {
	const names = categories(context);
	const gridColor = withAlpha(context.resolved.tokens.border, GRID_LINE_OPACITY);
	return {
		center: ['50%', radarCenterY(context.legend)],
		radius: '68%',
		startAngle: 90,
		shape: context.grid?.gridType ?? 'polygon',
		splitNumber: 4,
		indicator: names.map((name) => ({ name, max: indicatorMax(context) })),
		axisName: {
			show: Boolean(context.angleAxis) && !context.isLoading,
			color: context.resolved.tokens.mutedForeground,
			fontSize: 10
		},
		axisLine: {
			show: Boolean(context.grid) && !context.isLoading,
			lineStyle: { color: gridColor }
		},
		axisTick: { show: false },
		splitLine: {
			show: Boolean(context.grid) && !context.isLoading,
			lineStyle: { color: gridColor, type: [3, 4] }
		},
		splitArea: { show: false },
		axisLabel: {
			show: context.radiusAxis && !context.isLoading,
			color: context.resolved.tokens.mutedForeground,
			fontSize: 10,
			showMinLabel: false
		}
	};
}

function tooltipOption(context: RadarOptionContext): TooltipComponentOption {
	const slot = context.tooltip;
	const names = categories(context);
	return {
		show: Boolean(slot) && !context.isLoading,
		trigger: 'item',
		confine: true,
		backgroundColor: 'transparent',
		borderWidth: 0,
		padding: 0,
		extraCssText: 'box-shadow:none;',
		displayTransition: false,
		position: resolveTooltipPosition(slot?.position ?? 'variable'),
		formatter: (params: unknown) => {
			const item = (Array.isArray(params) ? params[0] : params) as {
				seriesId?: unknown;
				seriesName?: unknown;
				value?: unknown;
			} | null;
			if (!item) return '';
			const key = String(item.seriesId ?? '');
			if (key.startsWith('__')) return '';
			const configItem = context.config[key];
			const label =
				typeof configItem?.label === 'string' ? configItem.label : String(item.seriesName ?? key);
			const values = Array.isArray(item.value) ? item.value : [];
			const rows = names
				.map((name, index) =>
					tooltipRow({
						indicatorHtml: tooltipIndicatorHtml(key, getColorsCount(configItem ?? {})),
						labelText: name,
						valueText:
							typeof values[index] === 'number'
								? values[index].toLocaleString()
								: String(values[index] ?? ''),
						dimmed: ''
					})
				)
				.join('');
			const dimmed =
				context.selectedDataKey !== null && context.selectedDataKey !== key ? ' opacity-30' : '';
			return `<div class="grid min-w-32 items-start gap-1.5 border border-border/50 px-2.5 py-1.5 text-xs shadow-xl${dimmed} ${roundnessClass[slot?.roundness ?? 'lg']} ${tooltipVariantClass[slot?.variant ?? 'default']}"><div class="font-medium">${escapeTooltipHtml(label)}</div><div class="grid gap-1.5">${rows}</div></div>`;
		}
	};
}

function selectionOpacity(selected: string | null, key: string, clickable: boolean) {
	if (!clickable || selected === null || selected === key) return { fill: 1, stroke: 1, dot: 1 };
	return { fill: 0.1, stroke: 0.2, dot: 0.2 };
}

function realSeries(context: RadarOptionContext): RadarSeriesOption[] {
	const names = categories(context);
	const hasSelection = context.selectedDataKey !== null;
	return context.radars.map((radar) => {
		const key = radar.dataKey;
		const slots = context.resolved.series[key] ?? [FALLBACK_COLOR];
		const stroke = radarStrokePaint(slots);
		const isDither = context.renderStyle === 'dither';
		const areaPaint = isDither
			? rendererDitherPattern(
					slots,
					radar.ditherVariant ?? context.ditherVariant ?? 'gradient',
					context.ditherCellSize ?? 2,
					context
				)
			: radarFillPaint(slots);
		const shadowBlur = radar.glowing ? 8 : isDither ? bloomPixels(context.bloom) : 0;
		const dotColor = sampleGradient(slots, 0.5);
		const opacity = selectionOpacity(context.selectedDataKey, key, radar.isClickable);
		const restingVisible = radar.dotVariant !== 'none';
		const activeVisible = radar.activeDotVariant !== 'none';
		const restingDot = dotStyle(radar.dotVariant, dotColor, context.resolved.tokens.background);
		const activeDot = dotStyle(
			radar.activeDotVariant === 'none' ? 'default' : radar.activeDotVariant,
			dotColor,
			context.resolved.tokens.background
		);
		const areaStyle =
			radar.variant === 'filled'
				? { color: areaPaint, opacity: radar.fillOpacity * opacity.fill }
				: undefined;
		const lineStyle = {
			color: isDither ? sampleGradient(slots, 0.5) : stroke,
			width: isDither ? Math.max(STROKE_WIDTH, context.ditherCellSize ?? 2) : STROKE_WIDTH,
			type: isDither
				? ([context.ditherCellSize ?? 2, context.ditherCellSize ?? 2] as [number, number])
				: (radar.strokeVariant ?? 'solid'),
			opacity: opacity.stroke,
			shadowBlur,
			shadowColor: shadowBlur > 0 ? sampleGradient(slots, 0.5) : undefined
		};
		return {
			id: key,
			name: typeof context.config[key]?.label === 'string' ? context.config[key].label : key,
			type: 'radar',
			radarIndex: 0,
			data: [{ value: names.map((_, index) => Number(context.data[index]?.[key]) || 0) }],
			symbol: restingVisible || activeVisible ? 'circle' : 'none',
			symbolSize: restingVisible ? restingDot.size : activeDot.size,
			cursor: radar.isClickable ? 'pointer' : 'default',
			z: context.selectedDataKey === key ? 3 : hasSelection ? 1 : 2,
			lineStyle,
			areaStyle,
			itemStyle: restingVisible
				? { ...restingDot.itemStyle, opacity: opacity.dot }
				: { ...activeDot.itemStyle, opacity: 0 },
			emphasis: hasSelection
				? { disabled: true }
				: {
						itemStyle: { ...activeDot.itemStyle, opacity: 1 },
						lineStyle,
						...(areaStyle ? { areaStyle } : {})
					},
			animation: false
		};
	});
}

function loadingOption(context: RadarOptionContext): EChartsRadarOption {
	const count = Math.max(0, Math.floor(context.loadingPoints));
	return {
		animation: false,
		aria: { enabled: true },
		radar: {
			center: ['50%', radarCenterY(context.legend)],
			radius: '68%',
			startAngle: 90,
			shape: context.grid?.gridType ?? 'polygon',
			splitNumber: 4,
			indicator: Array.from({ length: count }, (_, index) => ({
				name: `${index}`,
				max: LOADING_MAX
			})),
			axisName: { show: false },
			axisLine: { show: false },
			axisTick: { show: false },
			splitLine: { show: false },
			splitArea: { show: false },
			axisLabel: { show: false }
		},
		tooltip: { show: false },
		series: [
			{
				id: '__loading',
				type: 'radar',
				radarIndex: 0,
				silent: true,
				symbol: 'none',
				data: [{ value: context.loadingData.slice(0, count) }],
				lineStyle: { color: withAlpha(context.resolved.tokens.foreground, 0), width: 2 },
				areaStyle: { color: withAlpha(context.resolved.tokens.foreground, 0) },
				animation: false,
				z: 1
			}
		]
	};
}

export function buildRadarOption(context: RadarOptionContext): EChartsRadarOption {
	if (context.isLoading) return loadingOption(context);
	return {
		animation: false,
		aria: { enabled: true },
		radar: radarComponent(context),
		tooltip: tooltipOption(context),
		series: realSeries(context)
	};
}
