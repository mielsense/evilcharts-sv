import { getContext, setContext } from 'svelte';
import type { ChartConfig } from './chart-config.js';

const CHART_CONTEXT_KEY = Symbol('evilcharts.chart');

export type ChartContextValue = {
	readonly config: ChartConfig;
	readonly chartId: string;
	/**
	 * Size the chart falls back to before its container has been measured — the reference
	 * passes this to Recharts' `<ResponsiveContainer initialDimension>`.
	 */
	readonly initialDimension: { width: number; height: number };
};

export function setChartContext(value: ChartContextValue) {
	setContext(CHART_CONTEXT_KEY, value);
	return value;
}

/**
 * Reads the container context, throwing a helpful error when used outside <ChartContainer />.
 */
export function useChart(): ChartContextValue {
	const context = getContext<ChartContextValue | undefined>(CHART_CONTEXT_KEY);

	if (!context) {
		throw new Error('useChart must be used within a <ChartContainer />');
	}

	return context;
}
