import type {
	DataZoomComponentOption,
	GridComponentOption,
	TooltipComponentOption
} from 'echarts/components';
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
import {
	createDitherPattern,
	type DitherBloom,
	type DitherVariant,
	type RenderStyle
} from '../../ui/echarts-dither/index.js';
import {
	BUFFER_DASH,
	type AxisRegistration,
	type BrushRegistration,
	type CurveType,
	type LegendRegistration,
	type LineRegistration,
	type TooltipRegistration
} from './types.js';
import { sliceFromIndex, sliceToIndex } from './interactions.js';

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
	bloom?: DitherBloom;
	rendererSize?: { width: number; height: number };
	getHoveredDataKey?: () => string | null;
	revealSink?: Record<string, unknown[]>;
};

const GLOW_LAYERS = [
	{ width: 2, opacity: 0.9, blur: 5, symbolPad: 2 },
	{ width: 2, opacity: 0.6, blur: 12, symbolPad: 6 },
	{ width: 2, opacity: 0.38, blur: 24, symbolPad: 11 },
	{ width: 2, opacity: 0.22, blur: 42, symbolPad: 16 }
] as const;

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
	if (context.xAxis?.dataKey) return context.xAxis.dataKey;
	if (context.xDataKey) return context.xDataKey;
	const series = new Set(context.lines.map((line) => line.dataKey));
	return Object.keys(context.data[0] ?? {}).find((key) => !series.has(key));
}

function categories(context: LineOptionContext): string[] {
	const key = categoryKey(context);
	return context.data.map((row, index) => String((key ? row[key] : undefined) ?? index));
}

function finiteNumber(value: unknown): number | null {
	return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function seriesValues(context: LineOptionContext, key: string): (number | null)[] {
	return context.data.map((row) => finiteNumber(row[key]));
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
				axisValue?: string | number;
				axisValueLabel?: string;
				name?: string;
				value?: unknown;
				data?: unknown;
			}>;
			const seen = new Set<string>();
			const rows = params
				.map((item) => {
					const rawId = item.seriesId ?? '';
					const key = rawId.startsWith('__buffer-')
						? rawId.slice('__buffer-'.length)
						: rawId.startsWith('__')
							? ''
							: rawId;
					if (!key) return '';
					const value =
						typeof item.data === 'object' && item.data && 'value' in item.data
							? (item.data as { value: unknown }).value
							: item.value;
					const numericValue = finiteNumber(value);
					if (numericValue === null) return '';
					if (seen.has(key)) return '';
					seen.add(key);
					const hovered = context.getHoveredDataKey?.() ?? null;
					return tooltipRow({
						indicatorHtml: tooltipIndicatorHtml(key, getColorsCount(context.config[key] ?? {})),
						labelText: labelFor(context.config, key),
						valueText: numericValue.toLocaleString(),
						dimmed:
							opacityFor(context.selectedDataKey, key) < 1 || (hovered !== null && hovered !== key)
								? ' opacity-30'
								: ''
					});
				})
				.join('');
			return tooltipShell({
				label: String(params[0]?.axisValue ?? params[0]?.name ?? ''),
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
	dotOpacity = 1
): LineSeriesOption['data'] {
	if (slots.length <= 1) return values;
	const restingVariant = line.dotVariant === 'none' ? line.activeDotVariant : line.dotVariant;
	const activeVariant =
		line.activeDotVariant === 'none' ? ('default' as const) : line.activeDotVariant;
	return values.map((value, index) => {
		if (value === null) return null;
		const paint = sampleGradient(slots, values.length > 1 ? index / (values.length - 1) : 0);
		return {
			value,
			itemStyle: { ...dotItemStyle(restingVariant, paint, background), opacity: dotOpacity },
			emphasis: {
				itemStyle: { ...dotItemStyle(activeVariant, paint, background), opacity: 1 }
			}
		};
	});
}

function bloomPixels(bloom: DitherBloom | undefined): number {
	if (bloom === 'aura') return 14;
	if (bloom === 'high') return 8;
	if (bloom === 'low') return 4;
	return 0;
}

function buildGlowSeries({
	line,
	values,
	curve,
	paint,
	slots,
	z,
	opacity,
	dotSize
}: {
	line: LineRegistration;
	values: (number | null)[];
	curve: { smooth: boolean; step: 'middle' | false };
	paint: ReturnType<typeof seriesPaint> | ReturnType<typeof createDitherPattern>;
	slots: string[];
	z: number;
	opacity: number;
	dotSize: number;
}): LineSeriesOption[] {
	const showDots = dotSize > 0;
	return GLOW_LAYERS.map((layer, index) => {
		const glowOpacity = layer.opacity * opacity;
		const data =
			slots.length <= 1 || !showDots
				? values
				: values.map((value, valueIndex) => {
						if (value === null) return null;
						return {
							value,
							itemStyle: {
								color: sampleGradient(
									slots,
									values.length > 1 ? valueIndex / (values.length - 1) : 0
								),
								opacity: glowOpacity
							}
						};
					});
		return {
			id: `__glow-${index}-${line.dataKey}`,
			type: 'line',
			data,
			smooth: curve.smooth,
			step: curve.step,
			connectNulls: line.connectNulls,
			silent: true,
			showSymbol: showDots,
			symbol: 'circle',
			symbolSize: showDots ? dotSize + layer.symbolPad : 0,
			tooltip: { show: false },
			z,
			lineStyle: {
				color: paint,
				width: layer.width,
				opacity: glowOpacity,
				shadowBlur: layer.blur,
				shadowColor: sampleGradient(slots, 0.5),
				cap: 'round',
				join: 'round'
			},
			itemStyle: { color: slots[0], opacity: glowOpacity },
			emphasis: {
				focus: 'none',
				scale: false,
				lineStyle: { opacity: glowOpacity },
				itemStyle: { opacity: glowOpacity }
			},
			blur: {
				lineStyle: { opacity: glowOpacity * 0.3 },
				itemStyle: { opacity: glowOpacity * 0.3 }
			}
		};
	});
}

function buildSeries(context: LineOptionContext): LineSeriesOption[] {
	if (context.isLoading) {
		const curve = curveConfig(context.curveType);
		return [
			{
				id: '__loading',
				type: 'line',
				data: context.loadingData,
				smooth: curve.smooth,
				step: curve.step,
				showSymbol: false,
				silent: true,
				lineStyle: { color: withAlpha(context.resolved.tokens.foreground, 0), width: 1 },
				z: 1,
				animation: false,
				tooltip: { show: false }
			}
		];
	}

	return context.lines.flatMap((line) => {
		const values = seriesValues(context, line.dataKey);
		const slots = context.resolved.series[line.dataKey] ?? ['rgba(120, 120, 120, 1)'];
		const isDither = context.renderStyle === 'dither' && line.strokeVariant !== 'animated-dashed';
		const paint = isDither
			? createDitherPattern(
					slots,
					line.ditherVariant ?? context.ditherVariant,
					context.ditherCellSize,
					1,
					{ height: context.rendererSize?.height }
				)
			: seriesPaint(slots);
		const dotPaint = seriesPaint(slots);
		const curve = curveConfig(line.curveType ?? context.curveType);
		const opacity = opacityFor(context.selectedDataKey, line.dataKey);
		const dot = dotStyle(line.dotVariant, dotPaint, context.resolved.tokens.background);
		const activeDot = dotStyle(line.activeDotVariant, dotPaint, context.resolved.tokens.background);
		const restingVisible = line.dotVariant !== 'none';
		const reveal = context.enableHoverReveal;
		const hasBuffer = !reveal && line.enableBufferLine && values.length >= 2;
		const revealActive = reveal && context.hoverRevealIndex !== null;
		const bodyValues = hasBuffer
			? values.map((value, index) => (index === values.length - 1 ? null : value))
			: values;
		const fullPoints = lineData(
			values,
			line,
			slots,
			context.resolved.tokens.background,
			opacity
		) as unknown[];
		if (reveal && context.revealSink) context.revealSink[line.dataKey] = fullPoints;
		const revealedPoints = revealActive
			? sliceToIndex(fullPoints, context.hoverRevealIndex as number)
			: hasBuffer
				? lineData(bodyValues, line, slots, context.resolved.tokens.background, opacity)
				: fullPoints;
		const hasSelection = context.selectedDataKey !== null;
		const z = context.selectedDataKey === line.dataKey ? 3 : hasSelection ? 1 : 2;
		const mainDash =
			hasBuffer || line.strokeVariant === 'solid' ? 'solid' : ([3, 3] as [number, number]);
		const rendererWidth = context.rendererSize?.width ?? 0;
		const strokePaint =
			reveal && slots.length > 1 && !isDither
				? new echarts.graphic.LinearGradient(
						8,
						0,
						Math.max(rendererWidth - 8, 9),
						0,
						slots.map((color, index) => ({
							offset: index / (slots.length - 1),
							color
						})),
						true
					)
				: paint;
		const series: LineSeriesOption[] = [];
		if (line.glowing && !reveal) {
			series.push(
				...buildGlowSeries({
					line,
					values,
					curve,
					paint,
					slots,
					z,
					opacity,
					dotSize: restingVisible ? dot.size : 0
				})
			);
		}
		const main: LineSeriesOption = {
			id: line.dataKey,
			name: labelFor(context.config, line.dataKey),
			type: 'line',
			data: revealedPoints as LineSeriesOption['data'],
			smooth: curve.smooth,
			step: curve.step,
			connectNulls: line.connectNulls,
			showSymbol: restingVisible,
			symbol: 'circle',
			symbolSize: restingVisible ? dot.size : activeDot.size,
			cursor: line.isClickable ? 'pointer' : 'default',
			triggerEvent: line.isClickable,
			silent: false,
			z,
			lineStyle: {
				color: strokePaint,
				width: isDither ? Math.max(line.strokeWidth, context.ditherCellSize) : line.strokeWidth,
				type: isDither ? [context.ditherCellSize, context.ditherCellSize] : mainDash,
				opacity,
				shadowBlur: isDither ? bloomPixels(context.bloom) : undefined,
				shadowColor:
					isDither && bloomPixels(context.bloom) > 0 ? sampleGradient(slots, 0.5) : undefined,
				cap:
					isDither && (line.ditherVariant ?? context.ditherVariant) === 'hatched'
						? 'butt'
						: 'round',
				join: 'round'
			},
			itemStyle:
				slots.length > 1
					? { opacity }
					: { ...(restingVisible ? dot.itemStyle : activeDot.itemStyle), opacity },
			emphasis: {
				focus:
					context.enableHoverHighlight && !context.enableHoverReveal && !hasSelection
						? 'series'
						: 'none',
				scale: restingVisible ? activeDot.size / Math.max(dot.size, 1) : 1,
				...(slots.length > 1 ? {} : { itemStyle: { ...activeDot.itemStyle, opacity: 1 } })
			},
			blur: {
				lineStyle: { opacity: 0.3 },
				itemStyle: { opacity: 0.3 }
			}
		};
		series.push(line.lineProps ? { ...main, ...line.lineProps } : main);

		if (reveal) {
			series.unshift({
				id: `__reveal-base-${line.dataKey}`,
				type: 'line',
				data: revealActive
					? (sliceFromIndex(
							fullPoints,
							context.hoverRevealIndex as number
						) as LineSeriesOption['data'])
					: (fullPoints as LineSeriesOption['data']),
				smooth: curve.smooth,
				step: curve.step,
				connectNulls: false,
				showSymbol: false,
				silent: true,
				z: z - 1,
				lineStyle: {
					color: context.resolved.tokens.mutedForeground,
					width: line.strokeWidth,
					type: mainDash,
					opacity: revealActive ? 0.3 : 0
				},
				emphasis: { disabled: true },
				blur: { lineStyle: { opacity: revealActive ? 0.3 : 0 } },
				tooltip: { show: false }
			});
			return series;
		}

		if (hasBuffer) {
			const bufferValues = values.map((value, index) =>
				index >= values.length - 2 ? value : null
			);
			series.push({
				id: `__buffer-${line.dataKey}`,
				name: labelFor(context.config, line.dataKey),
				type: 'line',
				data: lineData(bufferValues, line, slots, context.resolved.tokens.background, opacity),
				smooth: curve.smooth,
				step: curve.step,
				connectNulls: true,
				showSymbol: restingVisible,
				symbol: 'circle',
				symbolSize: restingVisible ? dot.size : activeDot.size,
				silent: true,
				z,
				lineStyle: { color: paint, width: line.strokeWidth, type: BUFFER_DASH, opacity },
				itemStyle:
					slots.length > 1
						? { opacity }
						: { ...(restingVisible ? dot.itemStyle : activeDot.itemStyle), opacity },
				emphasis: {
					focus: 'none',
					scale: false,
					lineStyle: { opacity },
					itemStyle: { opacity }
				},
				blur: { lineStyle: { opacity: 0.3 }, itemStyle: { opacity: 0.3 } }
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
	const effectiveAnimation = context.lines[0]?.animationType ?? context.animationType;
	const animation =
		!context.isLoading &&
		context.animation &&
		effectiveAnimation !== 'none' &&
		!context.reducedMotion;
	const animationOption = {
		animation,
		animationDuration: 1000,
		animationDurationUpdate: 0
	};

	if (!showBrush) {
		return {
			...animationOption,
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
		height: brushHeight,
		outerBoundsMode: 'none'
	};
	const miniSeries = context.lines.map((line) => ({
		id: `__mini-${line.dataKey}`,
		type: 'line' as const,
		xAxisIndex: 1,
		yAxisIndex: 1,
		data: seriesValues(context, line.dataKey),
		smooth: curveConfig(line.curveType ?? context.curveType).smooth,
		step: curveConfig(line.curveType ?? context.curveType).step,
		connectNulls: line.connectNulls,
		showSymbol: false,
		silent: true,
		emphasis: { disabled: true },
		tooltip: { show: false },
		z: 0,
		lineStyle: {
			color: context.resolved.series[line.dataKey]?.[0] ?? 'rgba(120, 120, 120, 1)',
			width: 1,
			opacity: opacityFor(context.selectedDataKey, line.dataKey) * 0.5
		},
		animation: false
	}));
	return {
		...animationOption,
		aria: { enabled: true },
		grid: [mainGrid, miniGrid],
		xAxis: [
			xAxis,
			{
				type: 'category',
				gridIndex: 1,
				boundaryGap: false,
				data: categories(context),
				show: false,
				axisPointer: { show: false }
			}
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
	let value = 30 + Math.random() * 20;
	for (let index = 0; index < points; index += 1) {
		value = Math.min(58, Math.max(16, value + (Math.random() - 0.5) * 16));
		values.push(Math.round(value));
	}
	return values;
}
