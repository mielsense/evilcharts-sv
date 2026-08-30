import { getContext, setContext } from 'svelte';
import { RegistrationSet } from '../../ui/echarts-chart/index.js';
import type { BackgroundRegistration, PieRegistration } from './types.js';

const PIE_CHART_CONTEXT = Symbol('evilcharts.echarts-pie-chart');

export class EChartsPieChartContext {
	pies = new RegistrationSet<PieRegistration>();
	backgrounds = new RegistrationSet<BackgroundRegistration>();
}

export function setEChartsPieChartContext(): EChartsPieChartContext {
	const context = new EChartsPieChartContext();
	setContext(PIE_CHART_CONTEXT, context);
	return context;
}

export function useEChartsPieChart(): EChartsPieChartContext {
	const context = getContext<EChartsPieChartContext | undefined>(PIE_CHART_CONTEXT);
	if (!context) {
		throw new Error('[EvilCharts] ECharts pie parts must be children of EChartsPieChart.');
	}
	return context;
}
