import type { BarSeriesOption } from 'echarts/charts';
import type { PolarComponentOption, TooltipComponentOption } from 'echarts/components';
import type { ComposeOption } from 'echarts/core';
import * as echarts from 'echarts/core';
import {
	getColorsCount,
	withAlpha,
	type ChartConfig,
	type ResolvedColors
} from '../../ui/echarts-chart/index.js';
import {
	resolveTooltipPosition,
	roundnessClass,
	tooltipIndicatorHtml,
	tooltipRow,
	tooltipVariantClass
} from '../../ui/echarts-tooltip/index.js';
import {
	LOADING_BARS,
	LOADING_MAX,
	type RadialBarRegistration,
	type RadialVariant,
	type TooltipRegistration
} from './types.js';

export type EChartsRadialOption = ComposeOption<
	BarSeriesOption | TooltipComponentOption | PolarComponentOption
>;

type ArrayItem<T> = T extends readonly (infer Item)[] ? Item : T;
type PolarOption = ArrayItem<NonNullable<EChartsRadialOption['polar']>>;
type AngleAxisOption = ArrayItem<NonNullable<EChartsRadialOption['angleAxis']>>;
type RadiusAxisOption = ArrayItem<NonNullable<EChartsRadialOption['radiusAxis']>>;

const FALLBACK_COLOR = 'rgba(120, 120, 120, 1)';
const TRACK_OPACITY = 0.15;
const SELECTED_DIM_OPACITY = 0.15;

export type RadialOptionContext = {
	categories: string[];
	values: number[];
	config: ChartConfig;
	radialBar: RadialBarRegistration;
	variant: RadialVariant;
	innerRadius: number | string;
	outerRadius: number | string;
	angleMax: number;
	selectedBar: string | null;
	tooltip?: TooltipRegistration;
	isLoading: boolean;
	loadingData: number[];
	resolved: ResolvedColors;
	animation: boolean;
	reducedMotion: boolean;
};

export function niceCeil(value: number): number {
	if (!Number.isFinite(value) || value <= 0) return 1;
	const rough = value / 5;
	const base = 10 ** Math.floor(Math.log10(rough));
	const fraction = rough / base;
	const niceFraction = fraction < 1.5 ? 1 : fraction < 3 ? 2 : fraction < 7 ? 5 : 10;
	const interval = niceFraction * base;
	return Math.ceil(value / interval) * interval;
}

export function createRadialLoadingData(count = LOADING_BARS): number[] {
	const rows: number[] = [];
	let value = 55 + Math.random() * 30;
	for (let index = 0; index < count; index += 1) {
		value = Math.min(LOADING_MAX, Math.max(40, value + (Math.random() - 0.5) * 30));
		rows.push(Math.round(value));
	}
	return rows;
}

function geometry(variant: RadialVariant) {
	return variant === 'semi'
		? { center: ['50%', '70%'] as [string, string], startAngle: 180, endAngle: 0 }
		: { center: ['50%', '50%'] as [string, string], startAngle: 90, endAngle: -270 };
}

function barPaint(colors: string[]): string | echarts.graphic.LinearGradient {
	if (colors.length <= 1) return colors[0] ?? FALLBACK_COLOR;
	return new echarts.graphic.LinearGradient(
		0,
		0,
		1,
		1,
		colors.map((color, index) => ({ offset: index / (colors.length - 1), color }))
	);
}

function polar(context: RadialOptionContext): PolarOption[] {
	const { center } = geometry(context.variant);
	const item: PolarOption = {
		center,
		radius: [context.innerRadius, context.outerRadius] as (number | string)[]
	};
	return [item, { ...item }];
}

function angleAxis(context: RadialOptionContext): AngleAxisOption[] {
	const { startAngle, endAngle } = geometry(context.variant);
	const item: AngleAxisOption = {
		type: 'value',
		min: 0,
		max: context.angleMax,
		startAngle,
		endAngle,
		clockwise: true,
		show: false,
		axisLine: { show: false },
		axisTick: { show: false },
		axisLabel: { show: false },
		splitLine: { show: false }
	};
	return [
		{ ...item, polarIndex: 0 },
		{ ...item, polarIndex: 1 }
	];
}

function radiusAxis(context: RadialOptionContext): RadiusAxisOption[] {
	const item: RadiusAxisOption = {
		type: 'category',
		data: context.categories,
		show: false,
		axisLine: { show: false },
		axisTick: { show: false },
		axisLabel: { show: false },
		splitLine: { show: false }
	};
	return [
		{ ...item, polarIndex: 0 },
		{ ...item, polarIndex: 1 }
	];
}

function track(context: RadialOptionContext, loading: boolean): BarSeriesOption {
	return {
		id: loading ? '__loading-track' : '__track',
		type: 'bar',
		coordinateSystem: 'polar',
		polarIndex: 1,
		data: context.categories.map(() => context.angleMax),
		barWidth: context.radialBar.barSize,
		roundCap: context.radialBar.cornerRadius > 0,
		silent: true,
		animation: false,
		emphasis: { disabled: true },
		itemStyle: { color: withAlpha(context.resolved.tokens.mutedForeground, TRACK_OPACITY) },
		z: 1
	};
}

function tooltip(context: RadialOptionContext): TooltipComponentOption {
	const slot = context.tooltip;
	return {
		show: Boolean(slot) && !context.isLoading,
		trigger: 'item',
		confine: true,
		displayTransition: false,
		backgroundColor: 'transparent',
		borderWidth: 0,
		padding: 0,
		extraCssText: 'box-shadow:none;',
		position: resolveTooltipPosition(slot?.position ?? 'variable'),
		formatter: (params) => {
			const item = (Array.isArray(params) ? params[0] : params) as {
				dataIndex?: number;
				value?: number | string;
				seriesId?: string;
			};
			if (!item || String(item.seriesId ?? '').startsWith('__')) return '';
			const key = context.categories[item.dataIndex ?? 0] ?? '';
			const configItem = context.config[key];
			const label = typeof configItem?.label === 'string' ? configItem.label : key;
			const value =
				typeof item.value === 'number' ? item.value.toLocaleString() : String(item.value ?? '');
			const row = tooltipRow({
				indicatorHtml: tooltipIndicatorHtml(key, getColorsCount(configItem ?? {})),
				labelText: label,
				valueText: value,
				dimmed: ''
			});
			return `<div class="grid min-w-32 items-start gap-1.5 border border-border/50 px-2.5 py-1.5 text-xs shadow-xl ${roundnessClass[slot?.roundness ?? 'lg']} ${tooltipVariantClass[slot?.variant ?? 'default']}"><div class="grid gap-1.5">${row}</div></div>`;
		}
	};
}

export function buildRadialOption(context: RadialOptionContext): EChartsRadialOption {
	if (context.isLoading) {
		const loadingContext = {
			...context,
			categories: Array.from({ length: LOADING_BARS }, (_, index) => String(index)),
			angleMax: LOADING_MAX
		};
		return {
			animation: false,
			aria: { enabled: false },
			polar: polar(loadingContext),
			angleAxis: angleAxis(loadingContext),
			radiusAxis: radiusAxis(loadingContext),
			tooltip: { show: false },
			series: [
				track(loadingContext, true),
				{
					id: '__loading',
					type: 'bar',
					coordinateSystem: 'polar',
					polarIndex: 0,
					data: context.loadingData,
					barWidth: context.radialBar.barSize,
					roundCap: context.radialBar.cornerRadius > 0,
					silent: true,
					emphasis: { disabled: true },
					animation: false,
					itemStyle: { color: withAlpha(context.resolved.tokens.foreground, 0) },
					z: 2
				}
			]
		};
	}

	const series: BarSeriesOption[] = [
		{
			id: 'radial-bars',
			type: 'bar',
			coordinateSystem: 'polar',
			polarIndex: 0,
			data: context.categories.map((key, index) => ({
				name: key,
				value: context.values[index] ?? 0,
				itemStyle: {
					color: barPaint(context.resolved.series[key] ?? [FALLBACK_COLOR]),
					opacity:
						context.radialBar.isClickable &&
						context.selectedBar !== null &&
						context.selectedBar !== key
							? SELECTED_DIM_OPACITY
							: 1
				}
			})),
			barWidth: context.radialBar.barSize,
			roundCap: context.radialBar.cornerRadius > 0,
			cursor: context.radialBar.isClickable ? 'pointer' : 'default',
			emphasis: { disabled: true },
			z: 3,
			animation: context.animation && !context.reducedMotion,
			animationDuration: 1000,
			animationDurationUpdate: 0
		}
	];
	if (context.radialBar.showBackground) series.push(track(context, false));

	const ariaDescription = context.categories
		.map((key, index) => {
			const configured = context.config[key]?.label;
			const label = typeof configured === 'string' && configured.length > 0 ? configured : key;
			return `${label} ${(context.values[index] ?? 0).toLocaleString()}`;
		})
		.join(', ');

	return {
		animation: context.animation && !context.reducedMotion,
		animationDuration: 1000,
		animationDurationUpdate: 0,
		aria: {
			enabled: true,
			label: { description: `Radial chart values: ${ariaDescription}.` }
		},
		polar: polar(context),
		angleAxis: angleAxis(context),
		radiusAxis: radiusAxis(context),
		tooltip: tooltip(context),
		series
	};
}

export function mergeRadialChartOptions(
	built: EChartsRadialOption,
	chartOptions?: Record<string, unknown>
): EChartsRadialOption {
	const merged = chartOptions ? { ...built, ...chartOptions } : built;
	return Object.assign(merged, {
		animation: built.animation,
		animationDuration: built.animationDuration,
		animationDurationUpdate: built.animationDurationUpdate
	}) as EChartsRadialOption;
}

export function radialShimmerStops(center: number, color: string) {
	const half = 0.2;
	const feather = 0.2;
	const alphaAt = (offset: number) => {
		const distance = Math.abs(offset - center);
		if (distance <= half - feather) return 0.4;
		if (distance >= half) return 0;
		return 0.4 * Math.sin(((1 - (distance - (half - feather)) / feather) * Math.PI) / 2);
	};
	return [
		0,
		center - half,
		center - half + feather,
		center,
		center + half - feather,
		center + half,
		1
	]
		.filter((offset) => offset >= 0 && offset <= 1)
		.sort((left, right) => left - right)
		.filter((offset, index, values) => index === 0 || offset - values[index - 1] > 1e-4)
		.map((offset) => ({ offset, color: withAlpha(color, alphaAt(offset)) }));
}
