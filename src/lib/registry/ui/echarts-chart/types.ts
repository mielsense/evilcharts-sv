import type { Component, Snippet } from 'svelte';

export const ECHARTS_RENDERERS = {
	canvas: 'canvas',
	svg: 'svg'
} as const;

export type EChartsRenderer = (typeof ECHARTS_RENDERERS)[keyof typeof ECHARTS_RENDERERS];
export const DEFAULT_ECHARTS_RENDERER = ECHARTS_RENDERERS.canvas;

export const THEMES = { light: '', dark: '.dark' } as const;
export type ThemeKey = keyof typeof THEMES;
export const THEME_KEYS = Object.keys(THEMES) as ThemeKey[];

type ThemeColorsBase = {
	[K in ThemeKey]?: string[];
};

export type AtLeastOneThemeColor = {
	[K in ThemeKey]: Required<Pick<ThemeColorsBase, K>> & Partial<Omit<ThemeColorsBase, K>>;
}[ThemeKey];

export type ChartConfig = Record<
	string,
	{
		label?: string | Snippet;
		icon?: Component<Record<string, never>>;
		colors?: AtLeastOneThemeColor;
	}
>;

export type ValidateConfigKeys<TData, TConfig> = {
	[K in keyof TConfig]: K extends keyof TData ? ChartConfig[string] : never;
};

export function validateChartConfigColors(config: ChartConfig): void {
	for (const [key, item] of Object.entries(config)) {
		if (!item.colors) continue;
		if (THEME_KEYS.some((theme) => item.colors?.[theme] !== undefined)) continue;

		throw new Error(
			`[EvilCharts] Invalid chart config for "${key}": colors must define light or dark.`
		);
	}
}

export type ChartAccessibility =
	| {
			label: string;
			labelledBy?: never;
			description?: string;
			describedBy?: string;
	  }
	| {
			label?: never;
			labelledBy: string;
			description?: string;
			describedBy?: string;
	  };

export type EChartsRenderStyle = 'native' | 'dither';
