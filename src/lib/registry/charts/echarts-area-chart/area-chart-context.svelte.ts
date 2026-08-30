import { getContext, setContext } from 'svelte';
import { RegistrationSet } from '../../ui/echarts-chart/index.js';
import type { AreaRegistration, AxisRegistration } from './types.js';

const CONTEXT = Symbol('evilcharts.echarts-area-chart');

export class EChartsAreaChartContext {
	areas = new RegistrationSet<AreaRegistration>();
	xAxes = new RegistrationSet<AxisRegistration>();
	yAxes = new RegistrationSet<AxisRegistration>();
	grids = new RegistrationSet<Record<string, never>>();
}

export function setEChartsAreaChartContext(): EChartsAreaChartContext {
	const context = new EChartsAreaChartContext();
	setContext(CONTEXT, context);
	return context;
}

export function useEChartsAreaChart(): EChartsAreaChartContext {
	const context = getContext<EChartsAreaChartContext | undefined>(CONTEXT);
	if (!context)
		throw new Error('[EvilCharts] ECharts area parts must be children of EChartsAreaChart.');
	return context;
}
