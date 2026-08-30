import type { BarSeriesOption, CustomSeriesOption } from 'echarts/charts';
import type {
	DataZoomComponentOption,
	GridComponentOption,
	MarkLineComponentOption,
	TooltipComponentOption
} from 'echarts/components';
import type { ComposeOption, EChartsType } from 'echarts/core';
import * as echarts from 'echarts/core';
import {
	flattenColor,
	getColorsCount,
	withAlpha,
	type ChartConfig,
	type ResolvedColors
} from '../../ui/echarts-chart/index.js';
import { buildBrushDataZoom, type BrushRange } from '../../ui/echarts-brush/index.js';
import {
	createDitherPattern,
	type DitherBloom,
	type DitherVariant,
	type RenderStyle
} from '../../ui/echarts-dither/index.js';
import { sampleGradient } from '../../ui/echarts-dot/index.js';
import {
	tooltipBaseOption,
	tooltipIndicatorHtml,
	tooltipRow,
	tooltipShell
} from '../../ui/echarts-tooltip/index.js';
import type {
	AxisRegistration,
	BarLayout,
	BarRegistration,
	BrushRegistration,
	LegendRegistration,
	StackType,
	TooltipRegistration
} from './types.js';

export type EChartsBarOption = ComposeOption<
	| BarSeriesOption
	| CustomSeriesOption
	| GridComponentOption
	| TooltipComponentOption
	| DataZoomComponentOption
	| MarkLineComponentOption
>;
type ArrayItem<T> = T extends readonly (infer Item)[] ? Item : T;
type XAxisOption = ArrayItem<NonNullable<EChartsBarOption['xAxis']>>;
type YAxisOption = ArrayItem<NonNullable<EChartsBarOption['yAxis']>>;
export type BarOptionContext = {
	data: Record<string, unknown>[];
	config: ChartConfig;
	bars: BarRegistration[];
	xDataKey?: string;
	stackType: StackType;
	layout: BarLayout;
	barRadius: number;
	barGap?: number;
	barCategoryGap?: number;
	selectedDataKey: string | null;
	enableMaxValueHighlight: boolean;
	referenceLine?: number | null;
	referenceLineFormatter?: (value: number) => string;
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
	valuePxPerUnit?: number | null;
	barWidthPx?: number | null;
	expand?: { key: string | null; hovered: number | null; progress: ReadonlyMap<number, number> };
};
const ditherBloomBlur = (style: RenderStyle, bloom?: DitherBloom) =>
	style !== 'dither' || bloom === 'off' || bloom === undefined
		? 0
		: bloom === 'aura'
			? 14
			: bloom === 'high'
				? 8
				: 4;

const GRAY = 'rgba(120, 120, 120, 1)';
const BLOCK_SIZE = 8;
const BLOCK_GAP = 4;
const BLOCK_TRACK_OPACITY = 0.22;
const STACK_SEGMENT_GAP = 4;
const STRIPPED_CAP_HEIGHT = 4;
const STRIPPED_BODY_ALPHA = 0.2;
const STRIPPED_CAP_MAX_FRACTION = 0.85;
const STRIPPED_FALLBACK_FRACTION = 0.12;
const EXPAND_COLLAPSED = 0.12;
const MAX_HIGHLIGHT_DIM = 0.16;
const labelFor = (config: ChartConfig, key: string) =>
	typeof config[key]?.label === 'string' ? (config[key].label as string) : key;
function ditherPlotBounds(c: BarOptionContext) {
	const top = c.legend?.verticalAlign === 'top' ? 42 : 16;
	const showBrush = c.layout === 'vertical' && Boolean(c.brush) && !c.isLoading;
	const bottom =
		8 +
		(showBrush ? (c.brush?.height ?? 56) + 30 + (c.xAxis?.label ? 22 : 0) : 0) +
		(c.legend?.verticalAlign === 'bottom' ? 34 : 0);
	return {
		height: Math.max(c.ditherCellSize, c.rendererSize.height - top - bottom),
		offsetY: top
	};
}
function categoryKey(c: BarOptionContext) {
	if (c.xDataKey) return c.xDataKey;
	const axis = c.layout === 'vertical' ? c.xAxis : c.yAxis;
	if (axis?.dataKey) return axis.dataKey;
	const keys = new Set(c.bars.map((bar) => bar.dataKey));
	return Object.keys(c.data[0] ?? {}).find((key) => !keys.has(key));
}
function categories(c: BarOptionContext) {
	const key = categoryKey(c);
	return c.data.map((row, i) => String((key ? row[key] : undefined) ?? i));
}
function rawValues(c: BarOptionContext, key: string): number[] {
	return c.data.map((row) =>
		typeof row[key] === 'number' && Number.isFinite(row[key]) ? (row[key] as number) : 0
	);
}
function values(c: BarOptionContext, key: string) {
	const raw = rawValues(c, key);
	if (c.stackType !== 'percent') return raw;
	return raw.map((value, i) => {
		const total = c.bars.reduce((sum, bar) => sum + rawValues(c, bar.dataKey)[i], 0);
		return total ? value / total : 0;
	});
}
function axisBase(c: BarOptionContext, axis: AxisRegistration | undefined, isCategory: boolean) {
	const { mutedForeground, border, background } = c.resolved.tokens;
	return {
		type: isCategory ? ('category' as const) : ('value' as const),
		data: isCategory ? (c.isLoading ? c.loadingData.map((_, i) => i) : categories(c)) : undefined,
		axisLine: { show: false },
		axisTick: {
			show: !c.isLoading && Boolean(axis) && !axis?.hideDots,
			length: 0.5,
			lineStyle: { color: flattenColor(border, background), width: 3, cap: 'round' }
		},
		axisLabel: {
			show: !c.isLoading && Boolean(axis),
			color: mutedForeground,
			fontSize: 10,
			margin: 8,
			formatter:
				!isCategory && c.stackType === 'percent'
					? (value: number) => `${Math.round(value * 100)}%`
					: axis?.tickFormatter
		},
		splitLine: {
			show: !isCategory && c.showGrid && !c.isLoading,
			lineStyle: { color: border, type: [3, 3], width: 1 }
		},
		name: c.isLoading ? undefined : axis?.label,
		nameLocation: 'middle' as const,
		nameGap: isCategory
			? c.layout === 'horizontal'
				? 38
				: 30
			: c.layout === 'horizontal'
				? 30
				: 38,
		nameTextStyle: { color: mutedForeground, fontSize: 10 },
		max: !isCategory && c.stackType === 'percent' ? 1 : undefined
	};
}
function axes(c: BarOptionContext): { xAxis: XAxisOption; yAxis: YAxisOption } {
	if (c.layout === 'horizontal')
		return {
			xAxis: axisBase(c, c.xAxis, false) as XAxisOption,
			yAxis: { ...axisBase(c, c.yAxis, true), inverse: true } as YAxisOption
		};
	return {
		xAxis: axisBase(c, c.xAxis, true) as XAxisOption,
		yAxis: axisBase(c, c.yAxis, false) as YAxisOption
	};
}
type ImagePattern = {
	image: HTMLCanvasElement;
	repeat: 'repeat';
	rotation?: number;
	scaleX?: number;
	scaleY?: number;
};

function solidVerticalPaint(slots: string[], alpha = 1) {
	if (slots.length <= 1) {
		const base = slots[0] ?? GRAY;
		return alpha === 1 ? base : withAlpha(base, alpha);
	}
	return new echarts.graphic.LinearGradient(
		0,
		0,
		0,
		1,
		slots.map((color, index) => ({
			offset: index / (slots.length - 1),
			color: withAlpha(color, alpha)
		}))
	);
}

function verticalFadePaint(slots: string[]) {
	const offsets = [0, 0.2, 0.45, 0.7, 0.9, 1];
	return new echarts.graphic.LinearGradient(
		0,
		0,
		0,
		1,
		offsets.map((offset) => ({
			offset,
			color: withAlpha(
				sampleGradient(slots, offset),
				offset <= 0.2 ? 1 : offset >= 0.9 ? 0 : 1 - (offset - 0.2) / 0.7
			)
		}))
	);
}

function duotoneSplitPaint(
	base: string,
	firstAlpha: number,
	secondAlpha: number,
	horizontal: boolean
) {
	const stops = [
		{ offset: 0, color: withAlpha(base, firstAlpha) },
		{ offset: 0.5, color: withAlpha(base, firstAlpha) },
		{ offset: 0.5, color: withAlpha(base, secondAlpha) },
		{ offset: 1, color: withAlpha(base, secondAlpha) }
	];
	return horizontal
		? new echarts.graphic.LinearGradient(0, 0, 0, 1, stops)
		: new echarts.graphic.LinearGradient(1, 0, 0, 0, stops);
}

function strippedDatumPaint(slots: string[], horizontal: boolean, capFraction: number) {
	const fraction = Math.min(Math.max(capFraction, 0), 1);
	const cap = withAlpha(sampleGradient(slots, 0), 1);
	const stops = [
		{ offset: 0, color: cap },
		{ offset: fraction, color: cap },
		{ offset: fraction, color: withAlpha(sampleGradient(slots, fraction), STRIPPED_BODY_ALPHA) },
		{ offset: 1, color: withAlpha(sampleGradient(slots, 1), STRIPPED_BODY_ALPHA) }
	];
	return horizontal
		? new echarts.graphic.LinearGradient(1, 0, 0, 0, stops)
		: new echarts.graphic.LinearGradient(0, 0, 0, 1, stops);
}

export function strippedCapFraction(value: number, valuePxPerUnit: number | null): number {
	if (valuePxPerUnit === null) return STRIPPED_FALLBACK_FRACTION;
	const barPixels = Math.abs(value) * valuePxPerUnit;
	if (!(barPixels > 0)) return STRIPPED_FALLBACK_FRACTION;
	return Math.min(STRIPPED_CAP_HEIGHT / barPixels, STRIPPED_CAP_MAX_FRACTION);
}

export function measureBarValueScale(chart: EChartsType, horizontal: boolean): number | null {
	try {
		const finder = horizontal ? { xAxisIndex: 0 } : { yAxisIndex: 0 };
		const start = chart.convertToPixel(finder, 0);
		const end = chart.convertToPixel(finder, 1);
		if (typeof start !== 'number' || typeof end !== 'number') return null;
		const delta = Math.abs(end - start);
		return Number.isFinite(delta) && delta > 0 ? delta : null;
	} catch {
		return null;
	}
}

export function measureBarWidth(
	chart: EChartsType,
	horizontal: boolean,
	barCategoryGap?: number
): number | null {
	try {
		const finder = horizontal ? { yAxisIndex: 0 } : { xAxisIndex: 0 };
		const start = chart.convertToPixel(finder, 0);
		const end = chart.convertToPixel(finder, 1);
		if (typeof start !== 'number' || typeof end !== 'number') return null;
		const pitch = Math.abs(end - start);
		if (!Number.isFinite(pitch) || pitch <= 0) return null;
		const width = barCategoryGap === undefined ? pitch * 0.8 : pitch - barCategoryGap;
		return width > 1 ? width : null;
	} catch {
		return null;
	}
}

function patternFill(
	kind: 'hatched' | 'buffer' | 'blocks',
	color: string,
	blockSize = BLOCK_SIZE
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
	if (kind === 'blocks') {
		size(1, blockSize + BLOCK_GAP);
		context.fillStyle = color;
		context.fillRect(0, 0, 1, blockSize);
		return pattern();
	}
	if (kind === 'hatched') {
		size(5, 5);
		context.fillStyle = withAlpha(color, 0.3);
		context.fillRect(0, 0, 5, 5);
		context.fillStyle = color;
		context.fillRect(0, 0, 1.5, 5);
		return pattern(-Math.PI / 4);
	}
	size(5, 5);
	context.fillStyle = color;
	context.fillRect(0, 0, 1, 5);
	return pattern(-Math.PI / 4);
}

export function createExpandablePaint(slots: string[], openness: number) {
	const base = slots[0] ?? GRAY;
	const half = Math.max(0, Math.min(1, openness)) / 2;
	const left = 0.5 - half;
	const right = 0.5 + half;
	const clear = withAlpha(base, 0);
	return new echarts.graphic.LinearGradient(0, 0, 1, 0, [
		{ offset: 0, color: clear },
		{ offset: left, color: clear },
		{ offset: left, color: base },
		{ offset: right, color: base },
		{ offset: right, color: clear },
		{ offset: 1, color: clear }
	]);
}
function barBorderRadius(radius: number, variant: BarRegistration['variant'], horizontal: boolean) {
	if (variant === 'blocks' || variant === 'expandable') return 0;
	if (variant !== 'stripped') return radius;
	return horizontal ? [0, radius, radius, 0] : [radius, radius, 0, 0];
}
function fill(c: BarOptionContext, bar: BarRegistration) {
	const slots = c.resolved.series[bar.dataKey] ?? [c.resolved.tokens.foreground];
	const color = slots[0] ?? c.resolved.tokens.foreground;
	if (c.renderStyle === 'dither')
		return createDitherPattern(
			slots,
			bar.ditherVariant ?? c.ditherVariant,
			c.ditherCellSize,
			1,
			ditherPlotBounds(c)
		);
	if (bar.variant === 'gradient') return verticalFadePaint(slots);
	if (bar.variant === 'duotone') return duotoneSplitPaint(color, 0.4, 1, c.layout === 'horizontal');
	if (bar.variant === 'duotone-reverse')
		return duotoneSplitPaint(color, 1, 0.4, c.layout === 'horizontal');
	if (bar.variant === 'hatched') return patternFill('hatched', color) ?? solidVerticalPaint(slots);
	if (bar.variant === 'blocks')
		return patternFill('blocks', color, c.barWidthPx ?? BLOCK_SIZE) ?? solidVerticalPaint(slots);
	if (bar.variant === 'stripped')
		return strippedDatumPaint(slots, c.layout === 'horizontal', STRIPPED_FALLBACK_FRACTION);
	if (bar.variant === 'expandable') return createExpandablePaint(slots, EXPAND_COLLAPSED);
	return solidVerticalPaint(slots);
}
function tooltip(c: BarOptionContext): TooltipComponentOption {
	const slot = c.tooltip;
	return {
		...tooltipBaseOption({
			present: Boolean(slot) && !c.isLoading,
			cursor: false,
			position: slot?.position ?? 'variable',
			axisPointerColor: c.resolved.tokens.border,
			strokeWidth: 0.8
		}),
		formatter: (raw) => {
			const params = (Array.isArray(raw) ? raw : [raw]) as Array<{
				seriesId?: string;
				axisValueLabel?: string;
				value?: unknown;
				data?: unknown;
			}>;
			const body = params
				.filter((p) => p.seriesId && !p.seriesId.startsWith('__'))
				.map((p) => {
					const key = p.seriesId as string;
					const rawValue =
						typeof p.data === 'object' && p.data && 'value' in p.data
							? (p.data as { value: unknown }).value
							: p.value;
					const value = Array.isArray(rawValue) ? rawValue.at(-1) : rawValue;
					return tooltipRow({
						indicatorHtml: tooltipIndicatorHtml(key, getColorsCount(c.config[key] ?? {})),
						labelText: labelFor(c.config, key),
						valueText: Number(value).toLocaleString(),
						dimmed: c.selectedDataKey && c.selectedDataKey !== key ? ' opacity-30' : ''
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

function isDarkBackground(color: string): boolean {
	const channels = color
		.match(/[\d.]+/g)
		?.slice(0, 3)
		.map(Number);
	if (!channels || channels.length < 3) return false;
	return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722 < 128;
}

function isometricSeries(
	c: BarOptionContext,
	bar: BarRegistration,
	maxIndex: number | null
): CustomSeriesOption {
	const slots = c.resolved.series[bar.dataKey] ?? [c.resolved.tokens.foreground];
	const base = slots[0] ?? c.resolved.tokens.foreground;
	const dark = isDarkBackground(c.resolved.tokens.background);
	const accent = dark ? '#15803d' : '#22c55e';
	const valuesForBar = values(c, bar.dataKey);

	return {
		id: bar.dataKey,
		name: labelFor(c.config, bar.dataKey),
		type: 'custom',
		coordinateSystem: 'cartesian2d',
		encode: { x: 0, y: 1 },
		data: valuesForBar.map((value, index) => [index, value]),
		cursor: bar.isClickable ? 'pointer' : 'default',
		renderItem(params, api) {
			const index = params.dataIndex;
			const value = Number(api.value(1));
			const top = api.coord([api.value(0), value]);
			const baseline = api.coord([api.value(0), 0]);
			const categorySize = api.size?.([1, 0]) ?? [0, 0];
			const width = Math.max(
				4,
				Number(Array.isArray(categorySize) ? categorySize[0] : categorySize) * 0.55
			);
			const depth = Math.min(10, Math.max(5, width * 0.24));
			const left = Number(top[0]) - width / 2;
			const right = Number(top[0]) + width / 2;
			const topY = Number(top[1]);
			const baseY = Number(baseline[1]);
			const height = Math.max(0, baseY - topY);
			const highlight = index === maxIndex;
			const color = highlight ? accent : base;
			const front = patternFill('hatched', color) ?? color;

			return {
				type: 'group',
				children: [
					{
						type: 'polygon',
						shape: {
							points: [
								[right, topY],
								[right + depth, topY - depth],
								[right + depth, baseY - depth],
								[right, baseY]
							]
						},
						style: { fill: withAlpha(color, 0.55) }
					},
					{
						type: 'polygon',
						shape: {
							points: [
								[left, topY],
								[right, topY],
								[right + depth, topY - depth],
								[left + depth, topY - depth]
							]
						},
						style: { fill: withAlpha(color, 0.78) }
					},
					{
						type: 'rect',
						shape: { x: left, y: topY, width, height },
						style: { fill: front }
					}
				]
			};
		},
		animation: c.animation && !c.reducedMotion,
		animationDuration: 700,
		animationDelay: (index) => index * 80,
		animationEasing: 'cubicOut'
	};
}

function referenceMarkLine(c: BarOptionContext) {
	if (c.referenceLine === null || c.referenceLine === undefined) return undefined;
	return {
		symbol: 'none',
		silent: true,
		lineStyle: {
			color: withAlpha(c.resolved.tokens.mutedForeground, 0.6),
			type: 'dashed' as const,
			width: 1
		},
		label: {
			show: true,
			position: c.layout === 'horizontal' ? ('end' as const) : ('insideEndTop' as const),
			formatter: c.referenceLineFormatter?.(c.referenceLine) ?? String(c.referenceLine),
			color: c.resolved.tokens.foreground,
			backgroundColor: c.resolved.tokens.background,
			borderColor: c.resolved.tokens.border,
			borderWidth: 1,
			borderRadius: 4,
			padding: [2, 5],
			fontFamily: 'var(--font-mono, monospace)',
			fontSize: 10
		},
		data: [c.layout === 'horizontal' ? { xAxis: c.referenceLine } : { yAxis: c.referenceLine }]
	};
}

function series(c: BarOptionContext): Array<BarSeriesOption | CustomSeriesOption> {
	if (c.isLoading) {
		return [
			{
				id: '__loading',
				type: 'bar',
				data: c.loadingData,
				barCategoryGap: '30%',
				silent: true,
				itemStyle: {
					color: withAlpha(c.resolved.tokens.foreground, 0),
					borderRadius: barBorderRadius(c.barRadius, 'default', c.layout === 'horizontal')
				},
				z: 1,
				animation: false
			}
		];
	}

	const totals = c.data.map((_, index) =>
		c.bars.reduce((sum, bar) => sum + rawValues(c, bar.dataKey)[index], 0)
	);
	const maxIndex = c.enableMaxValueHighlight
		? totals.reduce((best, total, index) => (total > (totals[best] ?? -Infinity) ? index : best), 0)
		: null;
	const horizontal = c.layout === 'horizontal';
	const built = c.bars.map((bar, seriesIndex): BarSeriesOption | CustomSeriesOption => {
		if (bar.variant === 'isometric') return isometricSeries(c, bar, maxIndex);
		const slots = c.resolved.series[bar.dataKey] ?? [GRAY];
		const baseColor = slots[0] ?? GRAY;
		const opacity = c.selectedDataKey === null || c.selectedDataKey === bar.dataKey ? 1 : 0.3;
		const paint = fill(c, bar);
		const bloomBlur = ditherBloomBlur(c.renderStyle, c.bloom);
		const bloomColor = bloomBlur ? withAlpha(baseColor, 0.55) : undefined;
		const vals = values(c, bar.dataKey);
		const radius = barBorderRadius(bar.radius ?? c.barRadius, bar.variant, horizontal);
		const expandedIndex = c.expand?.key === bar.dataKey ? c.expand.hovered : null;
		const openness = (index: number) =>
			c.expand?.key === bar.dataKey
				? (c.expand.progress.get(index) ?? EXPAND_COLLAPSED)
				: EXPAND_COLLAPSED;
		const datumStyle =
			bar.variant === 'stripped' ||
			bar.variant === 'expandable' ||
			bar.bufferBar ||
			bar.glowing ||
			maxIndex !== null ||
			opacity < 1;
		const dataPoints = datumStyle
			? vals.map((value, index) => {
					const buffer = bar.bufferBar && index === vals.length - 1;
					const muted = maxIndex !== null && index !== maxIndex;
					let color = paint;
					if (bar.variant === 'stripped') {
						color = strippedDatumPaint(
							slots,
							horizontal,
							strippedCapFraction(value, c.valuePxPerUnit ?? null)
						);
					}
					if (bar.variant === 'expandable') color = createExpandablePaint(slots, openness(index));
					if (buffer) color = patternFill('buffer', baseColor) ?? 'transparent';
					if (muted) color = withAlpha(c.resolved.tokens.mutedForeground, MAX_HIGHLIGHT_DIM);
					const glow = bar.glowing || index === maxIndex;
					return {
						value,
						...(bar.variant === 'expandable' ? { label: { show: index === expandedIndex } } : {}),
						itemStyle: {
							color,
							borderColor: buffer ? baseColor : undefined,
							borderWidth: buffer ? 1 : 0,
							borderRadius: radius,
							opacity,
							shadowBlur: glow ? 18 : bloomBlur,
							shadowColor: glow
								? withAlpha(
										sampleGradient(slots, vals.length > 1 ? index / (vals.length - 1) : 0),
										0.65
									)
								: bloomColor
						}
					};
				})
			: vals;
		return {
			id: bar.dataKey,
			name: labelFor(c.config, bar.dataKey),
			type: 'bar',
			data: dataPoints,
			stack: c.stackType === 'default' ? undefined : '__bar-stack',
			barGap: c.barGap,
			barCategoryGap: c.barCategoryGap,
			cursor: bar.isClickable ? 'pointer' : 'default',
			z: c.selectedDataKey === bar.dataKey ? 3 : c.selectedDataKey === null ? 2 : 1,
			label:
				bar.variant === 'expandable'
					? {
							show: false,
							position: 'top',
							color: c.resolved.tokens.foreground,
							fontFamily: 'var(--font-mono, monospace)',
							fontSize: 11
						}
					: undefined,
			showBackground: bar.variant === 'blocks',
			backgroundStyle:
				bar.variant === 'blocks'
					? {
							color:
								patternFill(
									'blocks',
									withAlpha(c.resolved.tokens.mutedForeground, BLOCK_TRACK_OPACITY),
									c.barWidthPx ?? BLOCK_SIZE
								) ?? withAlpha(c.resolved.tokens.mutedForeground, BLOCK_TRACK_OPACITY),
							borderRadius: radius
						}
					: undefined,
			itemStyle: {
				color: paint,
				borderRadius: radius,
				opacity,
				shadowBlur: bloomBlur,
				shadowColor: bloomColor
			},
			emphasis:
				bar.enableHoverHighlight && c.selectedDataKey === null
					? { focus: 'self', blurScope: 'coordinateSystem' }
					: { disabled: true },
			blur:
				bar.enableHoverHighlight && c.selectedDataKey === null
					? { itemStyle: { opacity: 0.3 } }
					: undefined,
			animation:
				c.animation && (bar.animationType ?? c.animationType) !== 'none' && !c.reducedMotion,
			animationDuration: 500,
			animationEasing: 'cubicOut',
			markLine: seriesIndex === 0 ? referenceMarkLine(c) : undefined,
			animationDelay: (index) => {
				const type = bar.animationType ?? c.animationType;
				const last = Math.max(0, c.data.length - 1);
				const center = last / 2;
				const rank =
					type === 'right-to-left'
						? last - index
						: type === 'center-out'
							? Math.abs(index - center)
							: type === 'edges-in'
								? center - Math.abs(index - center)
								: index;
				return rank * 50;
			}
		};
	});
	if (built.some((entry) => entry.type === 'custom')) return built;

	const gapUnits =
		c.stackType !== 'default' && built.length > 1 && c.valuePxPerUnit
			? STACK_SEGMENT_GAP / c.valuePxPerUnit
			: 0;
	if (!gapUnits) return built;
	return (built as BarSeriesOption[]).flatMap((entry, index) =>
		index === built.length - 1
			? [entry]
			: [
					entry,
					{
						id: `__stackgap-${index}`,
						type: 'bar' as const,
						stack: '__bar-stack',
						data: c.data.map(() => gapUnits),
						itemStyle: { color: 'transparent' },
						silent: true,
						tooltip: { show: false },
						legendHoverLink: false,
						emphasis: { disabled: true },
						animation: false,
						z: 1
					}
				]
	);
}
export function buildBarOption(c: BarOptionContext): EChartsBarOption {
	const allowBrush = c.layout === 'vertical' && Boolean(c.brush) && !c.isLoading;
	const height = c.brush?.height ?? 56;
	const bottom = c.legend?.verticalAlign === 'bottom' ? 34 : 6;
	const main: GridComponentOption = {
		left: 8,
		right: 8,
		top: c.legend?.verticalAlign === 'top' ? 42 : 16,
		bottom:
			8 +
			(allowBrush ? height + 30 + (c.xAxis?.label ? 22 : 0) : 0) +
			(c.legend?.verticalAlign === 'bottom' ? 34 : 0)
	};
	const builtAxes = axes(c);
	const mainSeries = series(c);
	if (!allowBrush)
		return {
			animation: c.animation && !c.reducedMotion,
			animationDuration: 500,
			animationDurationUpdate: 0,
			aria: { enabled: true },
			grid: main,
			xAxis: builtAxes.xAxis,
			yAxis: builtAxes.yAxis,
			tooltip: tooltip(c),
			series: mainSeries
		};
	const mini = c.bars.map((bar) => ({
		id: `__mini-${bar.dataKey}`,
		type: 'bar' as const,
		xAxisIndex: 1,
		yAxisIndex: 1,
		data: rawValues(c, bar.dataKey),
		stack: c.stackType === 'default' ? undefined : '__mini-total',
		silent: true,
		barCategoryGap: '20%',
		emphasis: { disabled: true },
		tooltip: { show: false },
		itemStyle: {
			color: c.resolved.series[bar.dataKey]?.[0] ?? c.resolved.tokens.foreground,
			opacity: 0.5 * (c.selectedDataKey !== null && c.selectedDataKey !== bar.dataKey ? 0.3 : 1),
			borderRadius: 1
		},
		z: 0,
		animation: false
	}));
	return {
		animation: c.animation && !c.reducedMotion,
		animationDuration: 500,
		animationDurationUpdate: 0,
		aria: { enabled: true },
		grid: [main, { left: 8, right: 8, bottom, height, outerBoundsMode: 'none' }],
		xAxis: [builtAxes.xAxis, { type: 'category', gridIndex: 1, data: categories(c), show: false }],
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
export function createBarLoadingData(count: number): number[] {
	const rows: number[] = [];
	let value = 40 + Math.random() * 25;
	for (let index = 0; index < Math.max(0, count); index += 1) {
		value = Math.min(85, Math.max(20, value + (Math.random() - 0.5) * 30));
		rows.push(Math.round(value));
	}
	return rows;
}
