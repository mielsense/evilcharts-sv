import * as echarts from 'echarts/core';
import { THEMES, THEME_KEYS, type ChartConfig, type ThemeKey } from './types.js';

export function getColorsCount(item: ChartConfig[string]): number {
	if (!item.colors) return 1;
	return Math.max(...THEME_KEYS.map((theme) => item.colors?.[theme]?.length ?? 0), 1);
}

export function distributeColors(colors: string[], maxCount: number): string[] {
	if (colors.length === 0) return [];
	if (colors.length >= maxCount) return colors.slice(0, maxCount);

	const result: string[] = [];
	const baseSlots = Math.floor(maxCount / colors.length);
	const extraSlots = maxCount % colors.length;
	for (let index = 0; index < colors.length; index += 1) {
		const slots = baseSlots + (index >= colors.length - extraSlots ? 1 : 0);
		for (let slot = 0; slot < slots; slot += 1) result.push(colors[index]);
	}
	return result;
}

export function buildChartCss(id: string, config: ChartConfig): string {
	const colorConfig = Object.entries(config).filter(([, item]) => item.colors);
	if (colorConfig.length === 0) return '';

	const variablesFor = (theme: ThemeKey) =>
		colorConfig
			.flatMap(([key, item]) => {
				const authored = item.colors?.[theme];
				if (!authored?.length) return [];
				return distributeColors(authored, getColorsCount(item)).map(
					(color, index) => `  --color-${key}-${index}: ${color};`
				);
			})
			.join('\n');

	return Object.entries(THEMES)
		.map(
			([theme, prefix]) =>
				`${prefix} [data-chart=${id}] {\n${variablesFor(theme as ThemeKey)}\n}`
		)
		.join('\n');
}

let normalizerContext: CanvasRenderingContext2D | null = null;

export function normalizeColor(value: string): string {
	const raw = value.trim();
	if (!raw || typeof document === 'undefined') return raw;

	if (!normalizerContext) {
		const canvas = document.createElement('canvas');
		canvas.width = 1;
		canvas.height = 1;
		normalizerContext = canvas.getContext('2d', { willReadFrequently: true });
	}
	if (!normalizerContext) return raw;

	normalizerContext.clearRect(0, 0, 1, 1);
	normalizerContext.fillStyle = '#000';
	normalizerContext.fillStyle = raw;
	normalizerContext.fillRect(0, 0, 1, 1);
	const [red, green, blue, alpha] = normalizerContext.getImageData(0, 0, 1, 1).data;
	return `rgba(${red}, ${green}, ${blue}, ${(alpha / 255).toFixed(3)})`;
}

export function withAlpha(color: string, alpha: number): string {
	const match = color.match(/rgba?\(([^)]+)\)/);
	if (!match) return color;
	const [red, green, blue, sourceAlpha] = match[1].split(',').map((part) => part.trim());
	const baseAlpha = sourceAlpha === undefined ? 1 : Number.parseFloat(sourceAlpha) || 0;
	return `rgba(${red}, ${green}, ${blue}, ${(baseAlpha * alpha).toFixed(3)})`;
}

export type ResolvedColors = {
	series: Record<string, string[]>;
	tokens: {
		mutedForeground: string;
		border: string;
		foreground: string;
		background: string;
	};
};

export function resolveColors(
	container: HTMLElement,
	config: ChartConfig,
	seriesKeys: string[]
): ResolvedColors {
	const computed = getComputedStyle(container);
	const series: Record<string, string[]> = {};

	for (const key of seriesKeys) {
		const count = getColorsCount(config[key] ?? {});
		series[key] = Array.from({ length: count }, (_, index) => {
			const raw = computed.getPropertyValue(`--color-${key}-${index}`).trim();
			return raw ? normalizeColor(raw) : 'rgba(120, 120, 120, 1)';
		});
	}

	const probe = document.createElement('span');
	probe.style.cssText =
		'position:absolute;width:0;height:0;visibility:hidden;pointer-events:none;';
	container.appendChild(probe);
	const readToken = (className: string) => {
		probe.className = className;
		return normalizeColor(getComputedStyle(probe).color);
	};
	const tokens = {
		mutedForeground: readToken('text-muted-foreground'),
		border: readToken('text-border'),
		foreground: readToken('text-foreground'),
		background: readToken('text-background')
	};
	probe.remove();

	return { series, tokens };
}

export function seriesPaint(slots: string[]): string | echarts.graphic.LinearGradient {
	if (slots.length <= 1) return slots[0] ?? 'rgba(120, 120, 120, 1)';
	return new echarts.graphic.LinearGradient(
		0,
		0,
		1,
		0,
		slots.map((color, index) => ({ offset: index / (slots.length - 1), color }))
	);
}

export function indicatorBackground(key: string, colorsCount: number): string {
	if (colorsCount <= 1) return `var(--color-${key}-0)`;
	const stops = Array.from({ length: colorsCount }, (_, index) => {
		const offset = (index / (colorsCount - 1)) * 100;
		return `var(--color-${key}-${index}) ${offset}%`;
	}).join(', ');
	return `linear-gradient(to right, ${stops})`;
}

export function flattenColor(color: string, base: string): string {
	const parse = (value: string) =>
		value
			.match(/rgba?\(([^)]+)\)/)?.[1]
			.split(',')
			.map((part) => Number.parseFloat(part)) ?? [0, 0, 0, 1];
	const [red, green, blue, alpha = 1] = parse(color);
	const [baseRed, baseGreen, baseBlue] = parse(base);
	const mix = (channel: number, baseChannel: number) =>
		Math.round(channel * alpha + baseChannel * (1 - alpha));
	return `rgb(${mix(red, baseRed)}, ${mix(green, baseGreen)}, ${mix(blue, baseBlue)})`;
}
