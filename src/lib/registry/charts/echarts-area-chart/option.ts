import type { LineSeriesOption } from 'echarts/charts';
import type {
	DataZoomComponentOption,
	GridComponentOption,
	TooltipComponentOption
} from 'echarts/components';
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
	style !== 'dither' || bloom === 'none' || bloom === undefined ? 0 : bloom === 'strong' ? 14 : 8;

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
function rawValues(c: AreaOptionContext, key: string): (number | null)[] {
	return c.data.map((row) =>
		typeof row[key] === 'number' && Number.isFinite(row[key]) ? (row[key] as number) : 0
	);
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
				length: 0.5,
				lineStyle: { color: dotColor, width: 3, cap: 'round' }
			},
			axisLabel: {
				show: !c.isLoading && Boolean(c.xAxis),
				color: mutedForeground,
				fontSize: 10,
				formatter: c.xAxis?.tickFormatter
			},
			splitLine: { show: false }
		},
		yAxis: {
			type: 'value',
			max: c.stackType === 'expanded' ? 1 : undefined,
			name: c.isLoading ? undefined : c.yAxis?.label,
			nameLocation: 'middle',
			nameGap: 42,
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
				formatter:
					c.stackType === 'expanded'
						? (value: number) => `${Math.round(value * 100)}%`
						: c.yAxis?.tickFormatter
			},
			splitLine: { show: c.showGrid, lineStyle: { color: border, type: [3, 3], width: 0.8 } }
		}
	};
}
function areaPaint(c: AreaOptionContext, area: AreaRegistration, slots: string[]) {
	const color = slots[0] ?? c.resolved.tokens.foreground;
	if (area.variant === 'none') return 'transparent';
	if (c.renderStyle === 'dither') {
		return createDitherPattern(slots, area.ditherVariant ?? c.ditherVariant, c.ditherCellSize, 0.8);
	}
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
	if (area.variant === 'dotted') return createDitherPattern(slots, 'dotted', 2, 0.65);
	if (area.variant === 'hatched') return createDitherPattern(slots, 'hatched', 2, 0.72);
	if (area.variant === 'lines') return createDitherPattern(slots, 'hatched', 1, 0.5);
	const reverse = area.variant === 'gradient-reverse';
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
					if (value === null || value === undefined) return '';
					seen.add(key);
					return tooltipRow({
						indicatorHtml: tooltipIndicatorHtml(key, getColorsCount(c.config[key] ?? {})),
						labelText: labelFor(c.config, key),
						valueText:
							c.stackType === 'expanded'
								? `${Math.round(Number(value) * 100)}%`
								: Number(value).toLocaleString(),
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
		const bloomBlur = ditherBloomBlur(c.renderStyle, c.bloom);
		const bloomColor =
			bloomBlur > 0 ? withAlpha(slots[0] ?? c.resolved.tokens.foreground, 0.55) : undefined;
		const ditherStroke = c.renderStyle === 'dither' && area.strokeVariant !== 'animated-dashed';
		const paint = ditherStroke
			? createDitherPattern(slots, area.ditherVariant ?? c.ditherVariant, c.ditherCellSize)
			: seriesPaint(slots);
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
		if (revealActive)
			result.push({
				id: `__reveal-base-${area.dataKey}`,
				type: 'line',
				data: vals.map((value, valueIndex) => (valueIndex < c.hoverRevealIndex! ? null : value)),
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
					type: area.strokeVariant === 'solid' ? 'solid' : [3, 3],
					opacity: 0.18
				},
				areaStyle: { opacity: 0 },
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
				color: paint,
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
				color: areaPaint(c, area, slots),
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
			animationDelay: (i) => i * 20,
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
				id: `__buffer-fill-${area.dataKey}`,
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
					color: areaPaint(c, area, slots),
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
	const mini = c.areas.map((area) => ({
		id: `__mini-${area.dataKey}`,
		type: 'line' as const,
		xAxisIndex: 1,
		yAxisIndex: 1,
		data: rawValues(c, area.dataKey),
		showSymbol: false,
		silent: true,
		lineStyle: {
			color: seriesPaint(c.resolved.series[area.dataKey] ?? []),
			width: 1,
			opacity: 0.5
		},
		areaStyle: {
			color: withAlpha(c.resolved.series[area.dataKey]?.[0] ?? c.resolved.tokens.foreground, 0.12)
		},
		animation: false
	}));
	return {
		animation: false,
		aria: { enabled: true },
		grid: [main, { left: 8, right: 8, bottom, height }],
		xAxis: [
			builtAxes.xAxis,
			{ type: 'category', gridIndex: 1, boundaryGap: false, data: categories(c), show: false }
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
	return Array.from({ length: Math.max(0, points) }, (_, i) =>
		Math.round(34 + Math.sin(i * 1.45) * 10 + Math.cos(i * 0.61) * 5)
	);
}
