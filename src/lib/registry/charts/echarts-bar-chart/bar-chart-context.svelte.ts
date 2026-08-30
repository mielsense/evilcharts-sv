import { getContext, setContext } from 'svelte';
import { RegistrationSet } from '../../ui/echarts-chart/index.js';
import type { AxisRegistration, BarRegistration } from './types.js';
const CONTEXT = Symbol('echarts-bar-chart');
export class EChartsBarChartContext {
	bars = new RegistrationSet<BarRegistration>();
	xAxes = new RegistrationSet<AxisRegistration>();
	yAxes = new RegistrationSet<AxisRegistration>();
	grids = new RegistrationSet<Record<string, never>>();
}
export function setEChartsBarChartContext() {
	const value = new EChartsBarChartContext();
	setContext(CONTEXT, value);
	return value;
}
export function useEChartsBarChart() {
	const value = getContext<EChartsBarChartContext | undefined>(CONTEXT);
	if (!value)
		throw new Error('[EvilCharts] ECharts bar parts must be children of EChartsBarChart.');
	return value;
}
