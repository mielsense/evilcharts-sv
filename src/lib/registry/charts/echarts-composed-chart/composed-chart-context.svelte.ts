import { getContext, setContext } from 'svelte';
import { RegistrationSet } from '../../ui/echarts-chart/index.js';
import type { AxisRegistration, BarRegistration, LineRegistration } from './types.js';
const CONTEXT = Symbol('echarts-composed-chart');
export class EChartsComposedChartContext {
	bars = new RegistrationSet<BarRegistration>();
	lines = new RegistrationSet<LineRegistration>();
	xAxes = new RegistrationSet<AxisRegistration>();
	yAxes = new RegistrationSet<AxisRegistration>();
	grids = new RegistrationSet<Record<string, never>>();
}
export function setEChartsComposedChartContext() {
	const value = new EChartsComposedChartContext();
	setContext(CONTEXT, value);
	return value;
}
export function useEChartsComposedChart() {
	const value = getContext<EChartsComposedChartContext | undefined>(CONTEXT);
	if (!value)
		throw new Error(
			'[EvilCharts] ECharts composed parts must be children of EChartsComposedChart.'
		);
	return value;
}
