import type { LineSeriesOption } from 'echarts/charts';
import type {
	DataZoomComponentOption,
	GridComponentOption,
	TooltipComponentOption
} from 'echarts/components';
import type { ComposeOption, EChartsType } from 'echarts/core';
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
import { buildBrushDataZoom, type BrushRange } from '../../ui/echarts-brush/index.js';
import {
	createDitherPattern,
	type DitherBloom,
	type DitherVariant,
	type RenderStyle
} from '../../ui/echarts-dither/index.js';
import {
	tooltipBaseOption,
	tooltipIndicatorHtml,
	tooltipRow,
	tooltipShell
} from '../../ui/echarts-tooltip/index.js';
import {
	BUFFER_DASH,
	type AreaRegistration,
	type AxisRegistration,
	type BrushRegistration,
	type CurveType,
	type LegendRegistration,
	type StackType,
	type TooltipRegistration
} from './types.js';

export type EChartsAreaOption = ComposeOption<
	LineSeriesOption | GridComponentOption | TooltipComponentOption | DataZoomComponentOption
>;
type ArrayItem<T> = T extends readonly (infer Item)[] ? Item : T;
type XAxisOption = ArrayItem<NonNullable<EChartsAreaOption['xAxis']>>;
type YAxisOption = ArrayItem<NonNullable<EChartsAreaOption['yAxis']>>;

export type AreaOptionContext = {
	data: Record<string, unknown>[];
	config: ChartConfig;
	areas: AreaRegistration[];
	xDataKey?: string;
	curveType: CurveType;
	stackType: StackType;
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

const labelFor = (config: ChartConfig, key: string) =>
	typeof config[key]?.label === 'string' ? (config[key].label as string) : key;
const opacityFor = (selected: string | null, key: string) =>
	selected === null || selected === key ? 1 : 0.3;
function curveConfig(curve: CurveType) {
	return curve === 'step'
		? { smooth: false, step: 'middle' as const }
		: { smooth: curve !== 'linear', step: false as const };
}
function categoryKey(c: AreaOptionContext) {
	if (c.xDataKey) return c.xDataKey;
	if (c.xAxis?.dataKey) return c.xAxis.dataKey;
	const keys = new Set(c.areas.map((area) => area.dataKey));
	return Object.keys(c.data[0] ?? {}).find((key) => !keys.has(key));
}
function categories(c: AreaOptionContext) {
	const key = categoryKey(c);
	return c.data.map((row, i) => String((key ? row[key] : undefined) ?? i));
}
function finiteNumber(value: unknown): number | null {
	return typeof value === 'number' && Number.isFinite(value) ? value : null;
}
function rawValues(c: AreaOptionContext, key: string): (number | null)[] {
	return c.data.map((row) => finiteNumber(row[key]));
}

function ditherPlotBounds(c: AreaOptionContext, reverse = false) {
	const top = c.legend?.verticalAlign === 'top' ? 42 : 16;
	const showBrush = Boolean(c.brush) && !c.isLoading;
	const bottom =
		8 +
		(showBrush ? (c.brush?.height ?? 56) + 30 + (c.xAxis?.label ? 22 : 0) : 0) +
		(c.legend?.verticalAlign === 'bottom' ? 34 : 0);
	return {
		height: Math.max(c.ditherCellSize, c.rendererSize.height - top - bottom),
		offsetY: top,
		reverse
	};
}
function values(c: AreaOptionContext, key: string) {
	const raw = rawValues(c, key);
	if (c.stackType !== 'expanded') return raw;
	return raw.map((value, index) => {
		if (value === null) return null;
		const total = c.areas.reduce((sum, area) => sum + (rawValues(c, area.dataKey)[index] ?? 0), 0);
		return total ? value / total : 0;
	});
}
function axes(c: AreaOptionContext): { xAxis: XAxisOption; yAxis: YAxisOption } {
	const { mutedForeground, border, background } = c.resolved.tokens;
	const dotColor = flattenColor(border, background);
	return {
		xAxis: {
			type: 'category',
			boundaryGap: false,
			data: c.isLoading ? c.loadingData.map((_, i) => i) : categories(c),
			name: c.isLoading ? undefined : c.xAxis?.label,
			nameLocation: 'middle',
			nameGap: 30,
			nameTextStyle: { color: mutedForeground, fontSize: 10 },
			axisLine: { show: false },
			axisTick: {
				show: !c.isLoading && Boolean(c.xAxis) && !c.xAxis?.hideDots,
				alignWithLabel: true,
				length: 0.5,
				lineStyle: { color: dotColor, width: 3, cap: 'round' }
			},
			axisLabel: {
				show: !c.isLoading && Boolean(c.xAxis),
				color: mutedForeground,
				fontSize: 10,
				margin: 8,
				formatter: c.xAxis?.tickFormatter
			},
			splitLine: { show: false }
		},
		yAxis: {
			type: 'value',
			max: c.stackType === 'expanded' ? 1 : undefined,
			name: c.isLoading ? undefined : c.yAxis?.label,
			nameLocation: 'middle',
			nameGap: 38,
			nameTextStyle: { color: mutedForeground, fontSize: 10 },
			axisLine: { show: false },
			axisTick: {
				show: !c.isLoading && Boolean(c.yAxis) && !c.yAxis?.hideDots,
				length: 0.5,
				lineStyle: { color: dotColor, width: 3, cap: 'round' }
			},
			axisLabel: {
				show: !c.isLoading && Boolean(c.yAxis),
				color: mutedForeground,
				fontSize: 10,
				margin: 8,
				formatter:
					c.stackType === 'expanded'
						? (value: number) => `${Math.round(value * 100)}%`
						: c.yAxis?.tickFormatter
			},
			splitLine: {
				show: c.showGrid && !c.isLoading,
				lineStyle: { color: border, type: [3, 3], width: 1 }
			}
		}
	};
}
type ImagePattern = {
	image: HTMLCanvasElement;
	repeat: 'repeat' | 'no-repeat';
	rotation?: number;
	scaleX?: number;
	scaleY?: number;
};

function nativePatternFill(
	kind: 'dotted' | 'lines' | 'hatched' | 'stripe',
	color: string
): ImagePattern | null {
	if (typeof document === 'undefined') return null;
	const dpr = Math.max(window.devicePixelRatio || 1, 1);
	const canvas = document.createElement('canvas');
	const context = canvas.getContext('2d');
	if (!context) return null;
	const size = (width: number, height: number) => {
		canvas.width = width * dpr;
		canvas.height = height * dpr;
		context.scale(dpr, dpr);
	};
	const pattern = (rotation = 0): ImagePattern => ({
		image: canvas,
		repeat: 'repeat',
		rotation,
		scaleX: 1 / dpr,
		scaleY: 1 / dpr
	});
	if (kind === 'dotted') {
		size(6, 6);
		context.fillStyle = withAlpha(color, 0.7);
		context.beginPath();
		context.arc(3, 3, 0.85, 0, Math.PI * 2);
		context.fill();
		return pattern();
	}
	if (kind === 'lines' || kind === 'stripe') {
		size(5, 5);
		context.strokeStyle = withAlpha(color, 0.3);
		context.lineWidth = 1;
		context.beginPath();
		context.moveTo(2.5, -1);
		context.lineTo(2.5, 6);
		context.stroke();
		return pattern(-Math.PI / 4);
	}
	size(20, 20);
	context.fillStyle = withAlpha(color, 0.06);
	context.fillRect(0, 0, 10, 20);
	context.fillStyle = withAlpha(color, 0.22);
	context.fillRect(10, 0, 10, 20);
	return pattern((20 * Math.PI) / 180);
}

function gradientFillTexture(slots: string[], width: number, height: number, reverse: boolean) {
	if (typeof document === 'undefined' || width < 1 || height < 1) return null;
	const canvas = document.createElement('canvas');
	canvas.width = Math.ceil(width);
	canvas.height = Math.ceil(height);
	const context = canvas.getContext('2d');
	if (!context) return null;
	const colors = context.createLinearGradient(0, 0, canvas.width, 0);
	for (const [index, color] of slots.entries()) {
		colors.addColorStop(index / (slots.length - 1), color);
	}
	context.fillStyle = colors;
	context.fillRect(0, 0, canvas.width, canvas.height);
	const fade = context.createLinearGradient(0, 0, 0, canvas.height);
	fade.addColorStop(0, `rgba(0, 0, 0, ${reverse ? 0 : 0.1})`);
	fade.addColorStop(1, `rgba(0, 0, 0, ${reverse ? 0.1 : 0})`);
	context.globalCompositeOperation = 'destination-in';
	context.fillStyle = fade;
	context.fillRect(0, 0, canvas.width, canvas.height);
	return canvas;
}

function patternFadeTexture(
	kind: 'dotted' | 'lines' | 'hatched',
	color: string,
	width: number,
	height: number
) {
	const source = nativePatternFill(kind, color);
	if (!source || typeof document === 'undefined' || width < 1 || height < 1) return null;
	const tile = source.image;
	const canvas = document.createElement('canvas');
	canvas.width = Math.ceil(width);
	canvas.height = Math.ceil(height);
	const context = canvas.getContext('2d');
	if (!context) return null;
	const pattern = context.createPattern(tile, 'repeat');
	if (!pattern) return null;
	if (typeof pattern.setTransform === 'function') {
		const transform = new DOMMatrix();
		transform.rotateSelf(((source.rotation ?? 0) * 180) / Math.PI);
		transform.scaleSelf(source.scaleX ?? 1, source.scaleY ?? 1);
		pattern.setTransform(transform);
	}
	context.fillStyle = pattern;
	context.fillRect(0, 0, canvas.width, canvas.height);
	const fade = context.createLinearGradient(0, 0, 0, canvas.height);
	fade.addColorStop(0, 'rgba(0, 0, 0, 1)');
	fade.addColorStop(1, 'rgba(0, 0, 0, 0)');
	context.globalCompositeOperation = 'destination-in';
	context.fillStyle = fade;
	context.fillRect(0, 0, canvas.width, canvas.height);
	return canvas;
}

function areaPaint(
	c: AreaOptionContext,
	area: AreaRegistration,
	slots: string[],
	showUnselected = false
) {
	const color = slots[0] ?? c.resolved.tokens.foreground;
	if (area.variant === 'none') return 'transparent';
	if (c.renderStyle === 'dither') {
		return createDitherPattern(
			slots,
			area.ditherVariant ?? c.ditherVariant,
			c.ditherCellSize,
			0.8,
			ditherPlotBounds(c, area.variant === 'gradient-reverse')
		);
	}
	if (showUnselected) return nativePatternFill('stripe', color) ?? withAlpha(color, 0.1);
	if (area.variant === 'solid') {
		if (slots.length > 1)
			return new echarts.graphic.LinearGradient(
				0,
				0,
				1,
				0,
				slots.map((slot, index) => ({
					offset: index / (slots.length - 1),
					color: withAlpha(slot, 0.1)
				}))
			);
		return withAlpha(color, 0.1);
	}
	if (area.variant === 'dotted' || area.variant === 'hatched' || area.variant === 'lines') {
		const texture = patternFadeTexture(
			area.variant,
			color,
			c.rendererSize.width,
			c.rendererSize.height
		);
		return texture
			? ({ image: texture, repeat: 'no-repeat' } as ImagePattern)
			: (nativePatternFill(area.variant, color) ?? withAlpha(color, 0.1));
	}
	const reverse = area.variant === 'gradient-reverse';
	if (slots.length > 1) {
		const texture = gradientFillTexture(
			slots,
			c.rendererSize.width,
			c.rendererSize.height,
			reverse
		);
		if (texture) return { image: texture, repeat: 'no-repeat' } as ImagePattern;
	}
	const transparent = withAlpha(color, 0);
	return new echarts.graphic.LinearGradient(0, reverse ? 1 : 0, 0, reverse ? 0 : 1, [
		{ offset: 0, color: withAlpha(color, 0.1) },
		{ offset: 1, color: transparent }
	]);
}
function tooltip(c: AreaOptionContext): TooltipComponentOption {
	const slot = c.tooltip;
	return {
		...tooltipBaseOption({
			present: Boolean(slot) && !c.isLoading,
			cursor: slot?.cursor ?? true,
			position: slot?.position ?? 'variable',
			axisPointerColor: c.resolved.tokens.border,
			strokeWidth: 0.8
		}),
		formatter: (raw) => {
			const params = (Array.isArray(raw) ? raw : [raw]) as Array<{
				seriesId?: string;
				seriesName?: string;
				axisValueLabel?: string;
				value?: unknown;
				data?: unknown;
			}>;
			const seen = new Set<string>();
			const body = params
				.map((p) => {
					const rawId = p.seriesId ?? '';
					const key = rawId.startsWith('__buffer-')
						? rawId.slice('__buffer-'.length)
						: rawId.startsWith('__')
							? ''
							: rawId || p.seriesName || '';
					if (!key || seen.has(key)) return '';
					const value =
						typeof p.data === 'object' && p.data && 'value' in p.data
							? (p.data as { value: unknown }).value
							: p.value;
					const numericValue = finiteNumber(value);
					if (numericValue === null) return '';
					seen.add(key);
					return tooltipRow({
						indicatorHtml: tooltipIndicatorHtml(key, getColorsCount(c.config[key] ?? {})),
						labelText: labelFor(c.config, key),
						valueText:
							c.stackType === 'expanded'
								? `${Math.round(numericValue * 100)}%`
								: numericValue.toLocaleString(),
						dimmed: opacityFor(c.selectedDataKey, key) < 1 ? ' opacity-30' : ''
					});
				})
				.join('');
			return tooltipShell({
				label: params[0]?.axisValueLabel ?? '',
				body,
				roundness: slot?.roundness ?? 'lg',
				variant: slot?.variant ?? 'default'
			});
		}
	};
}
function series(c: AreaOptionContext): LineSeriesOption[] {
	if (c.isLoading)
		return [
			{
				id: '__loading',
				type: 'line',
				data: c.loadingData,
				...curveConfig(c.curveType),
				showSymbol: false,
				silent: true,
				// The rAF shimmer reveals the fixed stroke and fill together. Keeping the
				// resting paint transparent prevents a solid line between sweeps.
				lineStyle: { color: withAlpha(c.resolved.tokens.foreground, 0), width: 1 },
				areaStyle: { color: withAlpha(c.resolved.tokens.foreground, 0) },
				z: 1,
				animation: false
			}
		];
	return c.areas.flatMap((area, index) => {
		const vals = values(c, area.dataKey);
		const slots = c.resolved.series[area.dataKey] ?? [c.resolved.tokens.foreground];
		const showUnselected = c.selectedDataKey !== null && c.selectedDataKey !== area.dataKey;
		const bloomBlur = ditherBloomBlur(c.renderStyle, c.bloom);
		const bloomColor =
			bloomBlur > 0 ? withAlpha(slots[0] ?? c.resolved.tokens.foreground, 0.55) : undefined;
		const ditherStroke = c.renderStyle === 'dither' && area.strokeVariant !== 'animated-dashed';
		const paint = ditherStroke
			? createDitherPattern(
					slots,
					area.ditherVariant ?? c.ditherVariant,
					c.ditherCellSize,
					1,
					ditherPlotBounds(c)
				)
			: seriesPaint(slots);
		const strokePaint =
			c.enableHoverReveal && slots.length > 1 && c.renderStyle === 'native'
				? new echarts.graphic.LinearGradient(
						8,
						0,
						Math.max(c.rendererSize.width - 8, 9),
						0,
						slots.map((color, slotIndex) => ({
							offset: slotIndex / (slots.length - 1),
							color
						})),
						true
					)
				: paint;
		const dotPaint = seriesPaint(slots);
		const curve = curveConfig(area.curveType ?? c.curveType);
		const opacity = opacityFor(c.selectedDataKey, area.dataKey);
		const dot = dotStyle(area.dotVariant, dotPaint, c.resolved.tokens.background);
		const activeDot = dotStyle(area.activeDotVariant, dotPaint, c.resolved.tokens.background);
		const hasBuffer = !c.enableHoverReveal && area.enableBufferLine && vals.length > 1;
		const revealActive =
			c.enableHoverReveal && c.hoverRevealIndex !== null && c.selectedDataKey === null;
		const visibleValues = revealActive
			? vals.map((value, valueIndex) => (valueIndex <= c.hoverRevealIndex! ? value : null))
			: hasBuffer
				? vals.map((v, i) => (i === vals.length - 1 ? null : v))
				: vals;
		const data = visibleValues.map((v, i) =>
			v === null || (area.dotVariant === 'none' && area.activeDotVariant === 'none')
				? v
				: {
						value: v,
						itemStyle: dotItemStyle(
							area.dotVariant,
							sampleGradient(slots, vals.length > 1 ? i / (vals.length - 1) : 0),
							c.resolved.tokens.background
						)
					}
		);
		const bufferData = vals.map((v, i) => {
			if (i < vals.length - 2 || v === null) return null;
			if (area.dotVariant === 'none' && area.activeDotVariant === 'none') return v;
			return {
				value: v,
				itemStyle: dotItemStyle(
					area.dotVariant,
					sampleGradient(slots, vals.length > 1 ? i / (vals.length - 1) : 0),
					c.resolved.tokens.background
				)
			};
		});
		const result: LineSeriesOption[] = [];
		if (c.enableHoverReveal)
			result.push({
				id: `__reveal-${area.dataKey}`,
				type: 'line',
				data: revealActive
					? vals.map((value, valueIndex) => (valueIndex < c.hoverRevealIndex! ? null : value))
					: vals,
				stack: c.stackType === 'default' ? undefined : '__area-reveal-stack',
				smooth: curve.smooth,
				step: curve.step,
				connectNulls: area.connectNulls,
				showSymbol: false,
				silent: true,
				z: index,
				lineStyle: {
					color: c.resolved.tokens.mutedForeground,
					width: area.strokeWidth,
					type: hasBuffer || area.strokeVariant === 'solid' ? 'solid' : [3, 3],
					opacity: revealActive ? 0.3 : 0
				},
				emphasis: { disabled: true },
				blur: { lineStyle: { opacity: revealActive ? 0.3 : 0 } },
				tooltip: { show: false },
				animation: false
			});
		result.push({
			id: area.dataKey,
			name: labelFor(c.config, area.dataKey),
			type: 'line',
			data,
			stack: c.stackType === 'default' ? undefined : '__area-stack',
			smooth: curve.smooth,
			step: curve.step,
			connectNulls: area.connectNulls,
			showSymbol: dot.size > 0,
			symbol: 'circle',
			symbolSize: dot.size > 0 ? dot.size : activeDot.size,
			cursor: area.isClickable ? 'pointer' : 'default',
			triggerEvent: area.isClickable,
			z: c.selectedDataKey === area.dataKey ? 3 : c.selectedDataKey === null ? 2 : 1,
			lineStyle: {
				color: strokePaint,
				width: ditherStroke ? Math.max(area.strokeWidth, c.ditherCellSize) : area.strokeWidth,
				type: ditherStroke
					? [c.ditherCellSize, c.ditherCellSize]
					: hasBuffer || area.strokeVariant === 'solid'
						? 'solid'
						: [3, 3],
				opacity,
				shadowBlur: bloomBlur,
				shadowColor: bloomColor
			},
			itemStyle: { ...dot.itemStyle, opacity },
			areaStyle: {
				color: areaPaint(c, area, slots, showUnselected),
				opacity: c.selectedDataKey === null || c.selectedDataKey === area.dataKey ? 0.8 : 0.1,
				shadowBlur: bloomBlur,
				shadowColor: bloomColor
			},
			emphasis: {
				focus:
					c.enableHoverHighlight && !c.enableHoverReveal && c.selectedDataKey === null
						? 'series'
						: 'none',
				scale: dot.size > 0 ? activeDot.size / Math.max(dot.size, 1) : 1,
				itemStyle: { ...activeDot.itemStyle, opacity: 1 }
			},
			blur: {
				lineStyle: { opacity: 0.3 },
				areaStyle: { opacity: 0.1 },
				itemStyle: { opacity: 0.3 }
			},
			animation:
				c.animation && (area.animationType ?? c.animationType) !== 'none' && !c.reducedMotion,
			animationDuration: 1000,
			animationDurationUpdate: 0
		});
		if (hasBuffer)
			result.push({
				id: `__buffer-${area.dataKey}`,
				type: 'line',
				data: bufferData,
				stack: c.stackType === 'default' ? undefined : '__area-buffer-stack',
				smooth: curve.smooth,
				step: curve.step,
				connectNulls: true,
				showSymbol: dot.size > 0,
				symbol: 'circle',
				symbolSize: dot.size > 0 ? dot.size : activeDot.size,
				silent: true,
				z: c.selectedDataKey === area.dataKey ? 3 : c.selectedDataKey === null ? 2 : 1,
				lineStyle: {
					color: paint,
					width: area.strokeWidth,
					type: BUFFER_DASH,
					opacity,
					shadowBlur: bloomBlur,
					shadowColor: bloomColor
				},
				itemStyle: { ...dot.itemStyle, opacity },
				emphasis: {
					disabled: false,
					scale: dot.size > 0 ? activeDot.size / Math.max(dot.size, 1) : 1,
					itemStyle: { ...activeDot.itemStyle, opacity: 1 }
				},
				blur: { lineStyle: { opacity: 0.3 }, itemStyle: { opacity: 0.3 } },
				areaStyle: { opacity: 0 },
				animation: false
			});
		if (hasBuffer)
			result.push({
				id: `__bufferfill-${area.dataKey}`,
				type: 'line',
				data: vals.map((v, i) => (i >= vals.length - 2 ? v : null)),
				stack: c.stackType === 'default' ? undefined : '__area-buffer-fill-stack',
				smooth: curve.smooth,
				step: curve.step,
				connectNulls: true,
				showSymbol: false,
				silent: true,
				z: index,
				lineStyle: { opacity: 0 },
				areaStyle: {
					color: areaPaint(c, area, slots, showUnselected),
					opacity: c.selectedDataKey === null || c.selectedDataKey === area.dataKey ? 0.8 : 0.1,
					shadowBlur: bloomBlur,
					shadowColor: bloomColor
				},
				animation: false,
				tooltip: { show: false }
			});
		return result;
	});
}
export function buildAreaOption(c: AreaOptionContext): EChartsAreaOption {
	const showBrush = Boolean(c.brush) && !c.isLoading;
	const height = c.brush?.height ?? 56;
	const bottom = c.legend?.verticalAlign === 'bottom' ? 34 : 6;
	const main: GridComponentOption = {
		left: 8,
		right: 8,
		top: c.legend?.verticalAlign === 'top' ? 42 : 16,
		bottom:
			8 +
			(showBrush ? height + 30 + (c.xAxis?.label ? 22 : 0) : 0) +
			(c.legend?.verticalAlign === 'bottom' ? 34 : 0)
	};
	const builtAxes = axes(c);
	const mainSeries = series(c);
	if (!showBrush)
		return {
			animation: false,
			aria: { enabled: true },
			grid: main,
			xAxis: builtAxes.xAxis,
			yAxis: builtAxes.yAxis,
			tooltip: tooltip(c),
			series: mainSeries
		};
	const mini = c.areas.map((area) => {
		const key = area.dataKey;
		const base = c.resolved.series[key]?.[0] ?? c.resolved.tokens.foreground;
		const curve = curveConfig(area.curveType ?? c.curveType);
		const selected = c.selectedDataKey === null || c.selectedDataKey === key;
		return {
			id: `__mini-${key}`,
			type: 'line' as const,
			xAxisIndex: 1,
			yAxisIndex: 1,
			data: rawValues(c, key),
			stack: c.stackType === 'default' ? undefined : '__mini-total',
			smooth: curve.smooth,
			step: curve.step,
			connectNulls: area.connectNulls,
			showSymbol: false,
			silent: true,
			emphasis: { disabled: true },
			tooltip: { show: false },
			lineStyle: {
				color: base,
				width: 1,
				opacity: 0.5 * (selected ? 1 : 0.3)
			},
			areaStyle: {
				color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
					{ offset: 0, color: withAlpha(base, 0.15 * (selected ? 1 : 0.125)) },
					{ offset: 1, color: withAlpha(base, 0) }
				])
			},
			z: 0,
			animation: false
		};
	});
	return {
		animation: false,
		aria: { enabled: true },
		grid: [main, { left: 8, right: 8, bottom, height, outerBoundsMode: 'none' }],
		xAxis: [
			builtAxes.xAxis,
			{
				type: 'category',
				gridIndex: 1,
				boundaryGap: false,
				data: categories(c),
				show: false,
				axisPointer: { show: false }
			}
		],
		yAxis: [builtAxes.yAxis, { type: 'value', gridIndex: 1, show: false }],
		tooltip: tooltip(c),
		dataZoom: buildBrushDataZoom({
			brushBottom: bottom,
			brushHeight: height,
			brushRange: c.brushRange,
			fillerColor: 'transparent'
		}),
		series: [...mainSeries, ...mini]
	};
}
export function createAreaLoadingData(points: number): number[] {
	const rows: number[] = [];
	let value = 30 + Math.random() * 20;
	for (let index = 0; index < Math.max(0, points); index += 1) {
		value = Math.min(58, Math.max(16, value + (Math.random() - 0.5) * 16));
		rows.push(Math.round(value));
	}
	return rows;
}

export function computeAreaPlottedTops(c: AreaOptionContext): Record<string, (number | null)[]> {
	const running = new Array(c.data.length).fill(0);
	const tops: Record<string, (number | null)[]> = {};
	for (const area of c.areas) {
		const plotted = values(c, area.dataKey);
		tops[area.dataKey] = plotted.map((value, index) => {
			if (value === null) return null;
			return c.stackType === 'default' ? value : (running[index] += value);
		});
	}
	return tops;
}

export function resolveAreaAtPixel(
	chart: EChartsType,
	tops: Record<string, (number | null)[]>,
	keys: string[],
	x: number,
	y: number
): string | null {
	if (keys.length < 2 || !chart.containPixel({ gridIndex: 0 }, [x, y])) return null;
	const converted = chart.convertFromPixel({ gridIndex: 0 }, [x, y]);
	const rawIndex = Array.isArray(converted) ? converted[0] : converted;
	if (typeof rawIndex !== 'number') return null;
	const index = Math.round(rawIndex);
	let nearest: string | null = null;
	let nearestDistance = Number.POSITIVE_INFINITY;
	let above: string | null = null;
	let abovePixelY = Number.NEGATIVE_INFINITY;
	for (const key of keys) {
		const value = tops[key]?.[index];
		if (value === null || value === undefined) continue;
		const point = chart.convertToPixel({ gridIndex: 0 }, [index, value]);
		const pixelY = Array.isArray(point) ? point[1] : undefined;
		if (typeof pixelY !== 'number') continue;
		const distance = Math.abs(pixelY - y);
		if (distance < nearestDistance) {
			nearestDistance = distance;
			nearest = key;
		}
		if (pixelY <= y && pixelY > abovePixelY) {
			abovePixelY = pixelY;
			above = key;
		}
	}
	return nearestDistance <= 10 ? nearest : above;
}
