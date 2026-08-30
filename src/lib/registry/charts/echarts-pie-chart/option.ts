import type { PieSeriesOption } from 'echarts/charts';
import type { TooltipComponentOption } from 'echarts/components';
import type { ComposeOption } from 'echarts/core';
import * as echarts from 'echarts/core';
import {
	getColorsCount,
	withAlpha,
	type ChartConfig,
	type ResolvedColors
} from '../../ui/echarts-chart/index.js';
import {
	createDitherPattern,
	type DitherVariant,
	type RenderStyle
} from '../../ui/echarts-dither/index.js';
import {
	resolveTooltipPosition,
	roundnessClass,
	tooltipIndicatorHtml,
	tooltipRow,
	tooltipVariantClass
} from '../../ui/echarts-tooltip/index.js';
import {
	DEFAULT_CORNER_RADIUS,
	DEFAULT_END_ANGLE,
	DEFAULT_INNER_RADIUS,
	DEFAULT_OUTER_RADIUS,
	DEFAULT_PADDING_ANGLE,
	DEFAULT_START_ANGLE,
	LOADING_SECTORS,
	REVEAL_DURATION,
	type DitherBloom,
	type LegendRegistration,
	type PieRegistration,
	type TooltipRegistration
} from './types.js';

export type EChartsPieOption = ComposeOption<PieSeriesOption | TooltipComponentOption>;

export type PieOptionContext = {
	data: Record<string, unknown>[];
	config: ChartConfig;
	dataKey: string;
	nameKey: string;
	pie?: PieRegistration;
	selectedSector: string | null;
	tooltip?: TooltipRegistration;
	legend?: LegendRegistration;
	isLoading: boolean;
	resolved: ResolvedColors;
	animation: boolean;
	reducedMotion: boolean;
	renderStyle?: RenderStyle;
	ditherVariant?: DitherVariant;
	ditherCellSize?: number;
	bloom?: DitherBloom;
	rendererSize?: { width: number; height: number };
};

const FALLBACK_COLOR = 'rgba(120, 120, 120, 1)';
const OVERLAP_BORDER_WIDTH = 5;
const SELECTED_OFFSET = 12;
const DIMMED_OPACITY = 0.15;
const LOADING_BASE_OPACITY = 0.15;
const LOADING_PEAK_OPACITY = 0.5;
const LOADING_SHIMMER_BAND = 0.28;
const LOADING_SHIMMER_FEATHER = 0.22;

function percent(value: string): number | null {
	const match = /^(-?(?:\d+\.?\d*|\.\d+))%$/.exec(value.trim());
	return match ? Number(match[1]) / 100 : null;
}

function pieDitherBounds(context: PieOptionContext) {
	const size = context.rendererSize;
	if (!size || size.width <= 0 || size.height <= 0) return undefined;
	const outer = context.pie?.outerRadius ?? DEFAULT_OUTER_RADIUS;
	const radius =
		typeof outer === 'number'
			? outer
			: (percent(outer) ?? 0.8) * (Math.min(size.width, size.height) / 2);
	const center = Number.parseFloat(centerY(context.legend)) / 100;
	return { height: radius * 2, offsetY: size.height * center - radius };
}

function rendererDitherPattern(
	slots: string[],
	variant: DitherVariant,
	cellSize: number,
	context: PieOptionContext
) {
	return createDitherPattern(slots, variant, cellSize, 1, pieDitherBounds(context));
}

function sectorPaint(
	slots: string[],
	renderStyle: RenderStyle,
	ditherVariant: DitherVariant,
	ditherCellSize: number,
	context: PieOptionContext
): string | echarts.graphic.LinearGradient | ReturnType<typeof createDitherPattern> {
	if (renderStyle === 'dither') {
		return rendererDitherPattern(slots, ditherVariant, ditherCellSize, context);
	}
	if (slots.length <= 1) return slots[0] ?? FALLBACK_COLOR;
	return new echarts.graphic.LinearGradient(
		0,
		0,
		1,
		1,
		slots.map((color, index) => ({ offset: index / (slots.length - 1), color }))
	);
}

function bloomPixels(bloom: DitherBloom | undefined): number {
	if (bloom === 'aura') return 14;
	if (bloom === 'high') return 8;
	if (bloom === 'low') return 4;
	return 0;
}

function sectorBorder(paddingAngle: number, background: string) {
	if (paddingAngle < 0) return { borderColor: background, borderWidth: OVERLAP_BORDER_WIDTH };
	if (paddingAngle > 0) return { borderColor: background, borderWidth: paddingAngle };
	return {};
}

function loadingSectorAlpha(position: number, center: number): number {
	const rawDistance = Math.abs(position - center);
	const distance = Math.min(rawDistance, 1 - rawDistance);
	if (distance >= LOADING_SHIMMER_BAND) return LOADING_BASE_OPACITY;
	if (distance <= LOADING_SHIMMER_BAND - LOADING_SHIMMER_FEATHER) {
		return LOADING_PEAK_OPACITY;
	}
	const progress =
		1 - (distance - (LOADING_SHIMMER_BAND - LOADING_SHIMMER_FEATHER)) / LOADING_SHIMMER_FEATHER;
	const eased = Math.sin((progress * Math.PI) / 2);
	return LOADING_BASE_OPACITY + (LOADING_PEAK_OPACITY - LOADING_BASE_OPACITY) * eased;
}

export function createPieLoadingFrame({
	center,
	foreground,
	background,
	cornerRadius,
	paddingAngle
}: {
	center?: number;
	foreground: string;
	background: string;
	cornerRadius: number;
	paddingAngle: number;
}) {
	return Array.from({ length: LOADING_SECTORS }, (_, index) => ({
		name: `__loading-${index}`,
		value: 1,
		itemStyle: {
			color: withAlpha(
				foreground,
				center === undefined
					? LOADING_BASE_OPACITY
					: loadingSectorAlpha((index + 0.5) / LOADING_SECTORS, center)
			),
			opacity: 1,
			borderRadius: cornerRadius,
			...sectorBorder(paddingAngle, background)
		}
	}));
}

function centerY(legend?: LegendRegistration): string {
	if (!legend) return '50%';
	if (legend.verticalAlign === 'bottom') return '45%';
	if (legend.verticalAlign === 'top') return '55%';
	return '50%';
}

function tooltipOption(context: PieOptionContext): TooltipComponentOption {
	const slot = context.tooltip;
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
				name?: unknown;
				value?: unknown;
				seriesId?: unknown;
			} | null;
			if (!item || String(item.seriesId ?? '').startsWith('__')) return '';
			const key = String(item.name ?? '');
			const configItem = context.config[key];
			const label = typeof configItem?.label === 'string' ? configItem.label : key;
			const value =
				typeof item.value === 'number' ? item.value.toLocaleString() : String(item.value ?? '');
			const row = tooltipRow({
				indicatorHtml: tooltipIndicatorHtml(key, getColorsCount(configItem ?? {})),
				labelText: label,
				valueText: value,
				dimmed:
					context.selectedSector !== null && context.selectedSector !== key ? ' opacity-30' : ''
			});
			return `<div class="grid min-w-32 items-start gap-1.5 border border-border/50 px-2.5 py-1.5 text-xs shadow-xl ${roundnessClass[slot?.roundness ?? 'lg']} ${tooltipVariantClass[slot?.variant ?? 'default']}"><div class="grid gap-1.5">${row}</div></div>`;
		}
	};
}

function realSeries(context: PieOptionContext): PieSeriesOption[] {
	const pie = context.pie;
	if (!pie) return [];
	const selected = context.selectedSector;
	const outside = pie.labelPosition === 'outside';
	const explicitLabelKey = pie.labelDataKey || null;
	const shadowBlur = context.renderStyle === 'dither' ? bloomPixels(context.bloom) : 0;
	const data = context.data.map((row) => {
		const name = String(row[context.nameKey]);
		const isSelected = pie.isClickable && selected === name;
		const dimmed = pie.isClickable && selected !== null && !isSelected;
		return {
			name,
			value: Number(row[context.dataKey]) || 0,
			selected: isSelected,
			itemStyle: {
				color: sectorPaint(
					context.resolved.series[name] ?? [FALLBACK_COLOR],
					context.renderStyle ?? 'native',
					pie.ditherVariant ?? context.ditherVariant ?? 'gradient',
					context.ditherCellSize ?? 2,
					context
				),
				opacity: dimmed ? DIMMED_OPACITY : 1,
				borderRadius: pie.cornerRadius,
				shadowBlur,
				shadowColor:
					shadowBlur > 0
						? (context.resolved.series[name]?.[0] ?? context.resolved.tokens.foreground)
						: undefined,
				...sectorBorder(pie.paddingAngle, context.resolved.tokens.background)
			}
		};
	});

	return [
		{
			id: 'pie',
			type: 'pie',
			center: ['50%', centerY(context.legend)],
			radius: [pie.innerRadius, pie.outerRadius],
			startAngle: pie.startAngle,
			endAngle: pie.endAngle,
			clockwise: false,
			padAngle: Math.min(pie.paddingAngle, 0),
			cursor: pie.isClickable ? 'pointer' : 'default',
			emphasis: { scale: false },
			selectedMode: pie.isClickable ? 'single' : false,
			selectedOffset: SELECTED_OFFSET,
			select: { itemStyle: {} },
			label: {
				show: pie.labelDataKey !== null,
				position: outside ? 'outside' : 'inner',
				color: outside
					? context.resolved.tokens.mutedForeground
					: context.resolved.tokens.background,
				fontSize: 12,
				fontWeight: 500,
				formatter: (params: { dataIndex: number; name?: string; value?: unknown }) => {
					const row = context.data[params.dataIndex];
					if (explicitLabelKey) return String(row?.[explicitLabelKey] ?? '');
					if (outside) {
						const label = context.config[String(params.name ?? '')]?.label;
						return typeof label === 'string' ? label : String(params.name ?? '');
					}
					return String(row?.[context.dataKey] ?? params.value ?? '');
				}
			},
			labelLine: outside
				? {
						show: true,
						length: 14,
						length2: 14,
						smooth: false,
						lineStyle: { color: withAlpha(context.resolved.tokens.mutedForeground, 0.45), width: 1 }
					}
				: { show: false },
			data,
			animation: context.animation && !context.reducedMotion,
			animationType: 'expansion',
			animationDuration: REVEAL_DURATION,
			animationDurationUpdate: 0
		}
	];
}

function loadingSeries(context: PieOptionContext): PieSeriesOption[] {
	const pie = context.pie;
	const innerRadius = pie?.innerRadius ?? DEFAULT_INNER_RADIUS;
	const outerRadius = pie?.outerRadius ?? DEFAULT_OUTER_RADIUS;
	const cornerRadius = pie?.cornerRadius ?? DEFAULT_CORNER_RADIUS;
	const paddingAngle = pie?.paddingAngle ?? DEFAULT_PADDING_ANGLE;
	const startAngle = pie?.startAngle ?? DEFAULT_START_ANGLE;
	const endAngle = pie?.endAngle ?? DEFAULT_END_ANGLE;
	return [
		{
			id: '__loading',
			type: 'pie',
			center: ['50%', centerY(context.legend)],
			radius: [innerRadius, outerRadius],
			startAngle,
			endAngle,
			clockwise: false,
			padAngle: Math.min(paddingAngle, 0),
			silent: true,
			emphasis: { scale: false },
			label: { show: false },
			labelLine: { show: false },
			animation: false,
			data: createPieLoadingFrame({
				foreground: context.resolved.tokens.foreground,
				background: context.resolved.tokens.background,
				cornerRadius,
				paddingAngle
			})
		}
	];
}

export function buildPieOption(context: PieOptionContext): EChartsPieOption {
	if (context.isLoading) {
		return {
			animation: false,
			aria: { enabled: true },
			tooltip: { show: false },
			series: loadingSeries(context)
		};
	}
	return {
		animation: false,
		aria: { enabled: true },
		tooltip: tooltipOption(context),
		series: realSeries(context)
	};
}
