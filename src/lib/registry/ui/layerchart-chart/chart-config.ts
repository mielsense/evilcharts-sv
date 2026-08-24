import type { Component, Snippet } from 'svelte';

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: '', dark: '.dark' } as const;

export type ThemeKey = keyof typeof THEMES;

// All Keys are optional at first
type ThemeColorsBase = {
	[K in ThemeKey]?: string[];
};

// Require at least one theme key
type AtLeastOneThemeColor = {
	[K in ThemeKey]: Required<Pick<ThemeColorsBase, K>> & Partial<Omit<ThemeColorsBase, K>>;
}[ThemeKey];

export const VALID_THEME_KEYS = Object.keys(THEMES) as ThemeKey[];

export { THEMES };

// Validation for chart config colors at runtime
export function validateChartConfigColors(config: ChartConfig): void {
	for (const [key, value] of Object.entries(config)) {
		if (value.colors) {
			const hasValidThemeKey = VALID_THEME_KEYS.some(
				(themeKey) => value.colors?.[themeKey] !== undefined
			);

			if (!hasValidThemeKey) {
				throw new Error(
					`[EvilCharts] Invalid chart config for "${key}": colors object must have at least one theme key (${VALID_THEME_KEYS.join(', ')}). Received empty object or invalid keys.`
				);
			}
		}
	}
}

export type ChartConfig = Record<
	string,
	{
		label?: string | Snippet;
		icon?: Component<Record<string, never>>;
		colors?: AtLeastOneThemeColor;
	}
>;

/** Validates that every config key also exists on the data row type. */
export type ValidateConfigKeys<TData, TConfig> = {
	[K in keyof TConfig]: K extends keyof TData ? ChartConfig[string] : never;
};
