import { getContext, setContext } from 'svelte';
import { RegistrationSet } from '../../ui/echarts-chart/index.js';
import type { AxisRegistration, LineRegistration } from './types.js';

const LINE_CHART_CONTEXT = Symbol('evilcharts.echarts-line-chart');

export class EChartsLineChartContext {
	lines = new RegistrationSet<LineRegistration>();
	xAxes = new RegistrationSet<AxisRegistration>();
	yAxes = new RegistrationSet<AxisRegistration>();
	grids = new RegistrationSet<Record<string, never>>();
}

export function setEChartsLineChartContext(): EChartsLineChartContext {
	const context = new EChartsLineChartContext();
	setContext(LINE_CHART_CONTEXT, context);
	return context;
}

export function useEChartsLineChart(): EChartsLineChartContext {
	const context = getContext<EChartsLineChartContext | undefined>(LINE_CHART_CONTEXT);
	if (!context) {
		throw new Error('[EvilCharts] ECharts line parts must be children of EChartsLineChart.');
	}
	return context;
}

