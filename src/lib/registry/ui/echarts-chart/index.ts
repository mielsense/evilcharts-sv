export { default as ChartContainer } from './chart-container.svelte';
export { default as ChartStyle } from './chart-style.svelte';
export { default as EChartsHost } from './echarts-host.svelte';
export { default as LoadingIndicator } from './loading-indicator.svelte';
export type { EChartsEventHandler } from './echarts-host.svelte';
export { RegistrationSet, type RegistrationGetter } from './registrations.svelte.js';
export {
	getEChartsSharedSlotContext,
	setEChartsSharedSlotContext,
	type EChartsSharedSlotName
} from './shared-slots.svelte.js';
export {
	buildChartCss,
	distributeColors,
	flattenColor,
	getColorsCount,
	indicatorBackground,
	normalizeColor,
	resolveColors,
	seriesPaint,
	withAlpha,
	type ResolvedColors
} from './colors.js';
export {
	DEFAULT_ECHARTS_RENDERER,
	ECHARTS_RENDERERS,
	THEMES,
	THEME_KEYS,
	validateChartConfigColors,
	type AtLeastOneThemeColor,
	type ChartAccessibility,
	type ChartConfig,
	type EChartsRenderer,
	type EChartsRenderStyle,
	type ThemeKey,
	type ValidateConfigKeys
} from './types.js';
