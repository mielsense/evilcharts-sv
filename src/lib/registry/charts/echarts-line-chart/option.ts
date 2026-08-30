import type { DataZoomComponentOption, GridComponentOption, TooltipComponentOption } from 'echarts/components';
import type { LineSeriesOption } from 'echarts/charts';
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
import type { DitherVariant, RenderStyle } from '../../ui/echarts-dither/index.js';
import { BUFFER_DASH, type AxisRegistration, type BrushRegistration, type CurveType, type LegendRegistration, type LineRegistration, type TooltipRegistration } from './types.js';

export type EChartsLineOption = ComposeOption<
	LineSeriesOption | GridComponentOption | TooltipComponentOption | DataZoomComponentOption
>;

type ArrayItem<T> = T extends readonly (infer Item)[] ? Item : T;
type XAxisOption = ArrayItem<NonNullable<EChartsLineOption['xAxis']>>;
type YAxisOption = ArrayItem<NonNullable<EChartsLineOption['yAxis']>>;

export type LineOptionContext = {
	data: Record<string, unknown>[];
	config: ChartConfig;
	lines: LineRegistration[];
	xDataKey?: string;
	curveType: CurveType;
	selectedDataKey: string | null;
	enableHoverHighlight: boolean;
	enableHoverReveal: boolean;
	hoverRevealIndex: number | null;
	xAxis?: AxisRegistration;
	yAxis?: AxisRegistration;
	showGrid: boolean;
	tooltip?: TooltipRegistration;
	legend?: LegendRegistration;
	brush?: BrushRegistration;
	brushRange: BrushRange;
	isLoading: boolean;
	loadingData: number[];
	resolved: ResolvedColors;
	animation: boolean;
	animationType: string;
	reducedMotion: boolean;
	renderStyle: RenderStyle;
	ditherVariant: DitherVariant;
	ditherCellSize: number;
};

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

function categoryKey(context: LineOptionContext): string | undefined {
	if (context.xDataKey) return context.xDataKey;
	if (context.xAxis?.dataKey) return context.xAxis.dataKey;
	const series = new Set(context.lines.map((line) => line.dataKey));
	return Object.keys(context.data[0] ?? {}).find((key) => !series.has(key));
}

function categories(context: LineOptionContext): string[] {
	const key = categoryKey(context);
	return context.data.map((row, index) => String((key ? row[key] : undefined) ?? index));
}

function buildAxes(context: LineOptionContext): { xAxis: XAxisOption; yAxis: YAxisOption } {
	const { mutedForeground, border, background } = context.resolved.tokens;
	const splitLineColor = withAlpha(border, 1);
	const dotColor = flattenColor(splitLineColor, background);
	const xAxis: XAxisOption = {
		type: 'category',
		boundaryGap: false,
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
		name: context.isLoading ? undefined : context.yAxis?.label,
		nameLocation: 'middle',
		nameGap: 42,
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
			formatter: context.yAxis?.tickFormatter
		},
		splitLine: {
			show: context.showGrid,
			lineStyle: { color: splitLineColor, type: [3, 3], width: 0.8 }
		}
	};
	return { xAxis, yAxis };
}

function tooltip(context: LineOptionContext): TooltipComponentOption {
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
					const value = typeof item.data === 'object' && item.data && 'value' in item.data
						? (item.data as { value: unknown }).value
						: item.value;
					return tooltipRow({
						indicatorHtml: tooltipIndicatorHtml(key, getColorsCount(context.config[key] ?? {})),
						labelText: labelFor(context.config, key),
						valueText: Number(value).toLocaleString(),
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

function buildSeries(context: LineOptionContext): LineSeriesOption[] {
	if (context.isLoading) {
		return [
			{
				id: '__loading',
				type: 'line',
				data: context.loadingData,
				smooth: true,
				showSymbol: false,
				silent: true,
				lineStyle: { color: withAlpha(context.resolved.tokens.foreground, 0.5), width: 1 },
				animation: false,
				tooltip: { show: false }
			}
		];
	}

	return context.lines.flatMap((line, lineIndex) => {
		const values = context.data.map((row) => {
			const raw = row[line.dataKey];
			return typeof raw === 'number' && Number.isFinite(raw) ? raw : null;
		});
		const slots = context.resolved.series[line.dataKey] ?? ['rgba(120, 120, 120, 1)'];
		const paint = seriesPaint(slots);
		const curve = curveConfig(line.curveType ?? context.curveType);
		const opacity = opacityFor(context.selectedDataKey, line.dataKey);
		const isDither = context.renderStyle === 'dither';
		const dot = dotStyle(line.dotVariant, paint, context.resolved.tokens.background);
		const activeDot = dotStyle(line.activeDotVariant, paint, context.resolved.tokens.background);
		const hasBuffer = line.enableBufferLine && values.length >= 2;
		const bodyValues = hasBuffer ? values.map((value, index) => (index === values.length - 1 ? null : value)) : values;
		const series: LineSeriesOption[] = [];
		if (context.enableHoverReveal && context.hoverRevealIndex !== null) {
			series.push({
				id: `__reveal-base-${line.dataKey}`,
				name: labelFor(context.config, line.dataKey),
				type: 'line',
				data: values,
				smooth: curve.smooth,
				step: curve.step,
				connectNulls: line.connectNulls,
				showSymbol: false,
				silent: true,
				z: lineIndex,
				lineStyle: {
					color: context.resolved.tokens.mutedForeground,
					width: line.strokeWidth,
					type: line.strokeVariant === 'solid' ? 'solid' : [3, 3],
					opacity: 0.22
				},
				animation: false
			});
		}
		const revealedValues =
			context.enableHoverReveal && context.hoverRevealIndex !== null
				? bodyValues.map((value, index) => (index <= context.hoverRevealIndex! ? value : null))
				: bodyValues;
		series.push({
			id: line.dataKey,
			name: labelFor(context.config, line.dataKey),
			type: 'line',
			data: lineData(revealedValues, line, slots, context.resolved.tokens.background),
			smooth: curve.smooth,
			step: curve.step,
			connectNulls: line.connectNulls,
			showSymbol: dot.size > 0,
			symbol: 'circle',
			symbolSize: dot.size,
			triggerLineEvent: line.isClickable,
			silent: false,
			z: 10 + lineIndex,
			lineStyle: {
				color: paint,
				width: isDither ? Math.max(line.strokeWidth, context.ditherCellSize) : line.strokeWidth,
				type: isDither
					? [context.ditherCellSize, context.ditherCellSize]
					: line.strokeVariant === 'solid'
						? 'solid'
						: [3, 3],
				opacity,
				shadowBlur: line.glowing ? 12 : 0,
				shadowColor: line.glowing ? sampleGradient(slots, 0.5) : undefined,
				cap: isDither || context.ditherVariant === 'hatched' ? 'butt' : 'round',
				join: 'round'
			},
			itemStyle: { ...dot.itemStyle, opacity },
			emphasis: {
				focus: context.enableHoverHighlight && context.selectedDataKey === null ? 'series' : 'none',
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
		});

		if (hasBuffer) {
			series.push({
				id: `__buffer-${line.dataKey}`,
				name: labelFor(context.config, line.dataKey),
				type: 'line',
				data: values.map((value, index) => (index >= values.length - 2 ? value : null)),
				smooth: curve.smooth,
				step: curve.step,
				connectNulls: false,
				showSymbol: false,
				silent: true,
				z: 11 + lineIndex,
				lineStyle: { color: paint, width: line.strokeWidth, type: BUFFER_DASH, opacity },
				animation: false
			});
		}
		return series;
	});
}

export function buildLineOption(context: LineOptionContext): EChartsLineOption {
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
	const miniSeries = context.lines.map((line) => ({
		id: `__mini-${line.dataKey}`,
		type: 'line' as const,
		xAxisIndex: 1,
		yAxisIndex: 1,
		data: context.data.map((row) => Number(row[line.dataKey]) || 0),
		showSymbol: false,
		silent: true,
		lineStyle: {
			color: seriesPaint(context.resolved.series[line.dataKey] ?? []),
			width: 1,
			opacity: 0.5
		},
		areaStyle: {
			color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
				{ offset: 0, color: withAlpha(context.resolved.series[line.dataKey]?.[0] ?? context.resolved.tokens.foreground, 0.15) },
				{ offset: 1, color: withAlpha(context.resolved.series[line.dataKey]?.[0] ?? context.resolved.tokens.foreground, 0) }
			])
		},
		animation: false
	}));
	return {
		animation: false,
		aria: { enabled: true },
		grid: [mainGrid, miniGrid],
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
		series: [...series, ...miniSeries]
	};
}

export function createLineLoadingData(points: number): number[] {
	const values: number[] = [];
	let value = 40;
	for (let index = 0; index < points; index += 1) {
		const change = Math.sin(index * 1.9) * 7 + Math.cos(index * 0.73) * 4;
		value = Math.min(58, Math.max(16, value + change));
		values.push(Math.round(value));
	}
	return values;
}
