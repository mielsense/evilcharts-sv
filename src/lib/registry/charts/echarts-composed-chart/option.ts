import type {
	DataZoomComponentOption,
	GridComponentOption,
	TooltipComponentOption
} from 'echarts/components';
import type { BarSeriesOption, LineSeriesOption } from 'echarts/charts';
import type { ComposeOption } from 'echarts/core';
import * as echarts from 'echarts/core';
import {
	flattenColor,
	getColorsCount,
	seriesPaint,
	withAlpha,
	type ChartConfig,
	type ResolvedColors
} from '../../ui/echarts-chart/index.js';
import { dotItemStyle, dotStyle, sampleGradient } from '../../ui/echarts-dot/index.js';
import {
	tooltipBaseOption,
	tooltipIndicatorHtml,
	tooltipRow,
	tooltipShell
} from '../../ui/echarts-tooltip/index.js';
import { buildBrushDataZoom, type BrushRange } from '../../ui/echarts-brush/index.js';
import {
	createDitherPattern,
	type DitherBloom,
	type DitherVariant,
	type RenderStyle
} from '../../ui/echarts-dither/index.js';
import type {
	AxisRegistration,
	BarRegistration,
	BrushRegistration,
	CurveType,
	LegendRegistration,
	LineRegistration,
	TooltipRegistration
} from './types.js';

export type EChartsComposedOption = ComposeOption<
	| LineSeriesOption
	| BarSeriesOption
	| GridComponentOption
	| TooltipComponentOption
	| DataZoomComponentOption
>;

type ArrayItem<T> = T extends readonly (infer Item)[] ? Item : T;
type XAxisOption = ArrayItem<NonNullable<EChartsComposedOption['xAxis']>>;
type YAxisOption = ArrayItem<NonNullable<EChartsComposedOption['yAxis']>>;

export type ComposedOptionContext = {
	data: Record<string, unknown>[];
	config: ChartConfig;
	lines: LineRegistration[];
	bars: BarRegistration[];
	xDataKey?: string;
	curveType: CurveType;
	selectedDataKey: string | null;
	barGap?: number | string;
	barCategoryGap?: number | string;
	xAxis?: AxisRegistration;
	yAxis?: AxisRegistration;
	showGrid: boolean;
	tooltip?: TooltipRegistration;
	legend?: LegendRegistration;
	brush?: BrushRegistration;
	brushRange: BrushRange;
	isLoading: boolean;
	loadingData: number[];
	loadingLineData: number[];
	resolved: ResolvedColors;
	animation: boolean;
	animationType: string;
	reducedMotion: boolean;
	rendererSize: { width: number; height: number };
	renderStyle: RenderStyle;
	ditherVariant: DitherVariant;
	ditherCellSize: number;
	bloom?: DitherBloom;
};

const ditherBloomBlur = (style: RenderStyle, bloom?: DitherBloom) =>
	style !== 'dither' || bloom === 'off' || bloom === undefined
		? 0
		: bloom === 'aura'
			? 14
			: bloom === 'high'
				? 8
				: 4;

function labelFor(config: ChartConfig, key: string): string {
	const label = config[key]?.label;
	return typeof label === 'string' ? label : key;
}

function curveConfig(curveType: CurveType): { smooth: boolean; step: 'middle' | false } {
	if (curveType === 'step') return { smooth: false, step: 'middle' };
	if (curveType === 'linear') return { smooth: false, step: false };
	return { smooth: true, step: false };
}

function opacityFor(selected: string | null, key: string): number {
	return selected === null || selected === key ? 1 : 0.3;
}

function ditherPlotBounds(context: ComposedOptionContext) {
	const top = context.legend?.verticalAlign === 'top' ? 42 : 16;
	const showBrush = Boolean(context.brush) && !context.isLoading;
	const bottom =
		8 +
		(showBrush ? (context.brush?.height ?? 56) + 30 + (context.xAxis?.label ? 22 : 0) : 0) +
		(context.legend?.verticalAlign === 'bottom' ? 34 : 0);
	return {
		height: Math.max(context.ditherCellSize, context.rendererSize.height - top - bottom),
		offsetY: top
	};
}

function categoryKey(context: ComposedOptionContext): string | undefined {
	if (context.xDataKey) return context.xDataKey;
	if (context.xAxis?.dataKey) return context.xAxis.dataKey;
	const series = new Set([
		...context.lines.map((line) => line.dataKey),
		...context.bars.map((bar) => bar.dataKey)
	]);
	return Object.keys(context.data[0] ?? {}).find((key) => !series.has(key));
}

function categories(context: ComposedOptionContext): string[] {
	const key = categoryKey(context);
	return context.data.map((row, index) => String((key ? row[key] : undefined) ?? index));
}

function finiteNumber(value: unknown): number | null {
	return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function seriesValues(context: ComposedOptionContext, key: string): (number | null)[] {
	return context.data.map((row) => finiteNumber(row[key]));
}

function buildAxes(context: ComposedOptionContext): { xAxis: XAxisOption; yAxis: YAxisOption } {
	const { mutedForeground, border, background } = context.resolved.tokens;
	const splitLineColor = withAlpha(border, 1);
	const dotColor = flattenColor(splitLineColor, background);
	const xAxis: XAxisOption = {
		type: 'category',
		boundaryGap: context.bars.length > 0 || context.isLoading,
		show: true,
		data: context.isLoading ? context.loadingData.map((_, index) => index) : categories(context),
		name: context.isLoading ? undefined : context.xAxis?.label,
		nameLocation: 'middle',
		nameGap: 30,
		nameTextStyle: { color: mutedForeground, fontSize: 10 },
		axisLine: { show: false },
		axisTick: {
			show: !context.isLoading && Boolean(context.xAxis) && !context.xAxis?.hideDots,
			alignWithLabel: true,
			length: 0.5,
			lineStyle: { color: dotColor, width: 3, cap: 'round' }
		},
		splitLine: { show: false },
		axisLabel: {
			show: !context.isLoading && Boolean(context.xAxis),
			color: mutedForeground,
			fontSize: 10,
			margin: 8,
			formatter: context.xAxis?.tickFormatter
		}
	};
	const yAxis: YAxisOption = {
		type: 'value',
		show: Boolean(context.yAxis) || context.showGrid,
		min: context.bars.length > 0 ? 0 : undefined,
		name: context.isLoading ? undefined : context.yAxis?.label,
		nameLocation: 'middle',
		nameGap: 38,
		nameTextStyle: { color: mutedForeground, fontSize: 10 },
		axisLine: { show: false },
		axisTick: {
			show: !context.isLoading && Boolean(context.yAxis) && !context.yAxis?.hideDots,
			length: 0.5,
			lineStyle: { color: dotColor, width: 3, cap: 'round' }
		},
		axisLabel: {
			show: !context.isLoading && Boolean(context.yAxis),
			color: mutedForeground,
			fontSize: 10,
			margin: 8,
			formatter: context.yAxis?.tickFormatter
		},
		splitLine: {
			show: context.showGrid && !context.isLoading,
			lineStyle: { color: splitLineColor, type: [3, 3], width: 1 }
		}
	};
	return { xAxis, yAxis };
}

function tooltip(context: ComposedOptionContext): TooltipComponentOption {
	const slot = context.tooltip;
	const base = tooltipBaseOption({
		present: Boolean(slot) && !context.isLoading,
		cursor: slot?.cursor ?? true,
		position: slot?.position ?? 'variable',
		axisPointerColor: context.resolved.tokens.border,
		strokeWidth: 0.8
	});
	return {
		...base,
		formatter: (rawParams) => {
			const params = (Array.isArray(rawParams) ? rawParams : [rawParams]) as Array<{
				seriesId?: string;
				seriesName?: string;
				axisValueLabel?: string;
				value?: unknown;
				data?: unknown;
			}>;
			const rows = params
				.filter((item) => item.seriesId && !item.seriesId.startsWith('__'))
				.map((item) => {
					const key = item.seriesId as string;
					const value =
						typeof item.data === 'object' && item.data && 'value' in item.data
							? (item.data as { value: unknown }).value
							: item.value;
					const numericValue = finiteNumber(value);
					if (numericValue === null) return '';
					return tooltipRow({
						indicatorHtml: tooltipIndicatorHtml(key, getColorsCount(context.config[key] ?? {})),
						labelText: labelFor(context.config, key),
						valueText: numericValue.toLocaleString(),
						dimmed: opacityFor(context.selectedDataKey, key) < 1 ? ' opacity-30' : ''
					});
				})
				.join('');
			return tooltipShell({
				label: params[0]?.axisValueLabel ?? '',
				body: rows,
				roundness: slot?.roundness ?? 'lg',
				variant: slot?.variant ?? 'default'
			});
		}
	};
}

function lineData(
	values: (number | null)[],
	line: LineRegistration,
	slots: string[],
	background: string,
	active = false
): LineSeriesOption['data'] {
	const variant = active ? line.activeDotVariant : line.dotVariant;
	return values.map((value, index) => {
		if (value === null) return null;
		const paint = sampleGradient(slots, values.length > 1 ? index / (values.length - 1) : 0);
		return {
			value,
			itemStyle: dotItemStyle(variant, paint, background),
			emphasis: { itemStyle: dotItemStyle(line.activeDotVariant, paint, background) }
		};
	});
}

function verticalBarPaint(slots: string[]) {
	if (slots.length <= 1) return slots[0] ?? 'rgba(120, 120, 120, 1)';
	return new echarts.graphic.LinearGradient(
		0,
		0,
		0,
		1,
		slots.map((color, index) => ({ offset: index / (slots.length - 1), color }))
	);
}

type ImagePattern = {
	image: HTMLCanvasElement;
	repeat: 'repeat';
	rotation: number;
	scaleX: number;
	scaleY: number;
};

function barHatchPattern(color: string): ImagePattern | null {
	if (typeof document === 'undefined') return null;
	const dpr = Math.max(window.devicePixelRatio || 1, 1);
	const canvas = document.createElement('canvas');
	const drawing = canvas.getContext('2d');
	if (!drawing) return null;
	canvas.width = 5 * dpr;
	canvas.height = 5 * dpr;
	drawing.scale(dpr, dpr);
	drawing.fillStyle = withAlpha(color, 0.3);
	drawing.fillRect(0, 0, 5, 5);
	drawing.fillStyle = color;
	drawing.fillRect(0, 0, 1.5, 5);
	return {
		image: canvas,
		repeat: 'repeat',
		rotation: -Math.PI / 4,
		scaleX: 1 / dpr,
		scaleY: 1 / dpr
	};
}

function composedBarPaint(context: ComposedOptionContext, bar: BarRegistration, slots: string[]) {
	const color = slots[0] ?? context.resolved.tokens.foreground;
	if (context.renderStyle === 'dither')
		return createDitherPattern(
			slots,
			bar.ditherVariant ?? context.ditherVariant,
			context.ditherCellSize,
			1,
			ditherPlotBounds(context)
		);
	if (bar.variant === 'hatched') return barHatchPattern(color) ?? color;
	if (bar.variant === 'gradient')
		return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
			{ offset: 0, color: sampleGradient(slots, 0) },
			{ offset: 0.2, color: sampleGradient(slots, 0.2) },
			{ offset: 0.9, color: withAlpha(sampleGradient(slots, 0.9), 0) },
			{ offset: 1, color: withAlpha(sampleGradient(slots, 1), 0) }
		]);
	if (bar.variant === 'duotone' || bar.variant === 'duotone-reverse') {
		const left = withAlpha(color, bar.variant === 'duotone-reverse' ? 1 : 0.4);
		const right = withAlpha(color, bar.variant === 'duotone-reverse' ? 0.4 : 1);
		return new echarts.graphic.LinearGradient(0, 0, 1, 0, [
			{ offset: 0, color: left },
			{ offset: 0.5, color: left },
			{ offset: 0.5, color: right },
			{ offset: 1, color: right }
		]);
	}
	if (bar.variant === 'stripped')
		return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
			{ offset: 0, color },
			{ offset: 0.05, color: withAlpha(color, 0.4) },
			{ offset: 1, color: withAlpha(color, 0.1) }
		]);
	return verticalBarPaint(slots);
}

function staggerDelay(type: string, index: number, count: number) {
	const last = Math.max(0, count - 1);
	const center = last / 2;
	const step =
		type === 'right-to-left'
			? last - index
			: type === 'center-out'
				? Math.abs(index - center)
				: type === 'edges-in'
					? center - Math.abs(index - center)
					: index;
	return step * 50;
}

function buildSeries(context: ComposedOptionContext): (LineSeriesOption | BarSeriesOption)[] {
	if (context.isLoading) {
		return [
			{
				id: '__loading',
				type: 'bar',
				data: context.loadingData,
				silent: true,
				barCategoryGap: '30%',
				itemStyle: {
					color: withAlpha(context.resolved.tokens.foreground, 0),
					borderRadius: [4, 4, 0, 0]
				},
				animation: false
			},
			{
				id: '__loading-line',
				type: 'line',
				data: context.loadingLineData,
				smooth: true,
				showSymbol: false,
				silent: true,
				lineStyle: { color: withAlpha(context.resolved.tokens.foreground, 0), width: 2 },
				animation: false,
				tooltip: { show: false }
			}
		];
	}

	const bars: BarSeriesOption[] = context.bars.map((bar) => {
		const slots = context.resolved.series[bar.dataKey] ?? [context.resolved.tokens.foreground];
		const color = slots[0] ?? context.resolved.tokens.foreground;
		const bloomBlur = ditherBloomBlur(context.renderStyle, context.bloom);
		const bloomColor = bloomBlur > 0 ? withAlpha(color, 0.55) : undefined;
		const values = seriesValues(context, bar.dataKey);
		const opacity =
			context.selectedDataKey === null || context.selectedDataKey === bar.dataKey ? 1 : 0.15;
		const variantColor = composedBarPaint(context, bar, slots);
		const base: BarSeriesOption = {
			id: bar.dataKey,
			name: labelFor(context.config, bar.dataKey),
			type: 'bar',
			data:
				bar.glow && slots.length > 1
					? values.map((value, index) => ({
							value,
							itemStyle: {
								shadowBlur: 16,
								shadowColor: withAlpha(
									sampleGradient(slots, values.length > 1 ? index / (values.length - 1) : 0),
									0.6
								)
							}
						}))
					: values,
			barGap: context.barGap,
			barCategoryGap: context.barCategoryGap,
			cursor: bar.isClickable ? 'pointer' : 'default',
			z: 2,
			itemStyle: {
				color: variantColor,
				opacity,
				borderRadius: bar.variant === 'stripped' ? 0 : bar.radius,
				shadowBlur: bar.glow && slots.length === 1 ? 16 : bloomBlur,
				shadowColor: bar.glow && slots.length === 1 ? withAlpha(color, 0.6) : bloomColor
			},
			emphasis: {
				focus: bar.enableHoverHighlight && context.selectedDataKey === null ? 'self' : 'none',
				blurScope: 'series'
			},
			blur:
				bar.enableHoverHighlight && context.selectedDataKey === null
					? { itemStyle: { opacity: 0.15 } }
					: undefined,
			animation:
				context.animation &&
				(bar.animationType ?? context.animationType) !== 'none' &&
				!context.reducedMotion,
			animationDuration: 500,
			animationEasing: 'cubicOut',
			animationDelay: (i) =>
				staggerDelay(bar.animationType ?? context.animationType, i, context.data.length)
		};
		return bar.barProps ? { ...base, ...bar.barProps } : base;
	});
	const lines = context.lines.flatMap((line, lineIndex) => {
		const values = seriesValues(context, line.dataKey);
		const slots = context.resolved.series[line.dataKey] ?? ['rgba(120, 120, 120, 1)'];
		const bloomBlur = ditherBloomBlur(context.renderStyle, context.bloom);
		const bloomColor =
			bloomBlur > 0 ? withAlpha(slots[0] ?? context.resolved.tokens.foreground, 0.55) : undefined;
		const ditherStroke =
			context.renderStyle === 'dither' && line.strokeVariant !== 'animated-dashed';
		const paint = ditherStroke
			? createDitherPattern(
					slots,
					line.ditherVariant ?? context.ditherVariant,
					context.ditherCellSize,
					1,
					ditherPlotBounds(context)
				)
			: seriesPaint(slots);
		const dotPaint = seriesPaint(slots);
		const curve = curveConfig(line.curveType ?? context.curveType);
		const opacity = opacityFor(context.selectedDataKey, line.dataKey);
		const dot = dotStyle(line.dotVariant, dotPaint, context.resolved.tokens.background);
		const activeDot = dotStyle(line.activeDotVariant, dotPaint, context.resolved.tokens.background);
		const series: LineSeriesOption[] = [];
		if (line.glow) {
			for (const [glowIndex, layer] of [
				{ opacity: 0.22, blur: 42 },
				{ opacity: 0.38, blur: 24 },
				{ opacity: 0.6, blur: 12 },
				{ opacity: 0.9, blur: 5 }
			].entries()) {
				series.push({
					id: `__glow-${line.dataKey}-${glowIndex}`,
					type: 'line',
					data: values,
					smooth: curve.smooth,
					step: curve.step,
					connectNulls: line.connectNulls,
					showSymbol: false,
					silent: true,
					z: 2,
					lineStyle: {
						color: paint,
						width: 2,
						opacity: layer.opacity * opacity,
						shadowBlur: layer.blur,
						shadowColor: sampleGradient(slots, 0.5),
						cap: 'round',
						join: 'round'
					},
					animation: false,
					tooltip: { show: false },
					emphasis: { disabled: true }
				});
			}
		}
		const base: LineSeriesOption = {
			id: line.dataKey,
			name: labelFor(context.config, line.dataKey),
			type: 'line',
			data: lineData(values, line, slots, context.resolved.tokens.background),
			smooth: curve.smooth,
			step: curve.step,
			connectNulls: line.connectNulls,
			showSymbol: dot.size > 0,
			symbol: 'circle',
			symbolSize: dot.size > 0 ? dot.size : activeDot.size,
			cursor: line.isClickable ? 'pointer' : 'default',
			triggerEvent: line.isClickable,
			silent: false,
			z: 3 + lineIndex,
			lineStyle: {
				color: paint,
				width: ditherStroke ? Math.max(2, context.ditherCellSize) : 2,
				type: ditherStroke
					? [context.ditherCellSize, context.ditherCellSize]
					: line.strokeVariant === 'solid'
						? 'solid'
						: [5, 5],
				opacity,
				cap: 'round',
				join: 'round',
				shadowBlur: bloomBlur,
				shadowColor: bloomColor
			},
			itemStyle: { ...dot.itemStyle, opacity },
			emphasis: {
				focus: 'none',
				scale: activeDot.size > dot.size ? activeDot.size / Math.max(1, dot.size) : false,
				lineStyle: { opacity },
				itemStyle: { ...activeDot.itemStyle, opacity }
			},
			blur: {
				lineStyle: { opacity: 0.3 },
				itemStyle: { opacity: 0.3 }
			},
			animation: context.animation && context.animationType !== 'none' && !context.reducedMotion,
			animationDuration: 1000,
			animationDurationUpdate: 0
		};
		series.push(line.lineProps ? { ...base, ...line.lineProps } : base);
		return series;
	});
	return [...bars, ...lines];
}

export function buildComposedOption(context: ComposedOptionContext): EChartsComposedOption {
	const legendTop = context.legend?.verticalAlign === 'top';
	const legendBottom = context.legend?.verticalAlign === 'bottom';
	const brushHeight = context.brush?.height ?? 56;
	const showBrush = Boolean(context.brush) && !context.isLoading;
	const brushGap = showBrush ? brushHeight + 30 + (context.xAxis?.label ? 22 : 0) : 0;
	const mainGrid: GridComponentOption = {
		left: 8,
		right: 8,
		top: legendTop ? 42 : 16,
		bottom: 8 + brushGap + (legendBottom ? 34 : 0)
	};
	const { xAxis, yAxis } = buildAxes(context);
	const series = buildSeries(context);

	if (!showBrush) {
		return {
			animation: false,
			aria: { enabled: true },
			grid: mainGrid,
			xAxis,
			yAxis,
			tooltip: tooltip(context),
			series
		};
	}

	const brushBottom = legendBottom ? 34 : 6;
	const miniGrid: GridComponentOption = {
		left: 8,
		right: 8,
		bottom: brushBottom,
		height: brushHeight
	};
	const miniInputs = [
		...context.bars.map((bar) => ({
			dataKey: bar.dataKey,
			curveType: undefined,
			connectNulls: false
		})),
		...context.lines.map((line) => ({
			dataKey: line.dataKey,
			curveType: line.curveType,
			connectNulls: line.connectNulls
		}))
	];
	const miniLines = miniInputs.map((line) => {
		const curve = curveConfig(line.curveType ?? context.curveType);
		const opacity = opacityFor(context.selectedDataKey, line.dataKey);
		return {
			id: `__mini-${line.dataKey}`,
			type: 'line' as const,
			xAxisIndex: 1,
			yAxisIndex: 1,
			data: seriesValues(context, line.dataKey),
			smooth: curve.smooth,
			step: curve.step,
			connectNulls: line.connectNulls,
			showSymbol: false,
			silent: true,
			lineStyle: {
				color: seriesPaint(context.resolved.series[line.dataKey] ?? []),
				width: 1,
				opacity: 0.5 * opacity
			},
			areaStyle: {
				color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
					{
						offset: 0,
						color: withAlpha(
							context.resolved.series[line.dataKey]?.[0] ?? context.resolved.tokens.foreground,
							0.15 *
								(context.selectedDataKey === null || context.selectedDataKey === line.dataKey
									? 1
									: 0.15)
						)
					},
					{
						offset: 1,
						color: withAlpha(
							context.resolved.series[line.dataKey]?.[0] ?? context.resolved.tokens.foreground,
							0
						)
					}
				])
			},
			emphasis: { disabled: true },
			tooltip: { show: false },
			z: 0,
			animation: false
		};
	});
	return {
		animation: false,
		aria: { enabled: true },
		grid: [mainGrid, { ...miniGrid, outerBoundsMode: 'none' }],
		xAxis: [
			xAxis,
			{ type: 'category', gridIndex: 1, boundaryGap: false, data: categories(context), show: false }
		],
		yAxis: [yAxis, { type: 'value', gridIndex: 1, show: false }],
		tooltip: tooltip(context),
		dataZoom: buildBrushDataZoom({
			brushBottom,
			brushHeight,
			brushRange: context.brushRange,
			fillerColor: 'transparent'
		}),
		series: [...series, ...miniLines]
	};
}

export function createComposedLoadingData(points: number): number[] {
	const values: number[] = [];
	let value = 30 + Math.random() * 20;
	for (let index = 0; index < points; index += 1) {
		value = Math.min(58, Math.max(16, value + (Math.random() - 0.5) * 16));
		values.push(Math.round(value));
	}
	return values;
}
