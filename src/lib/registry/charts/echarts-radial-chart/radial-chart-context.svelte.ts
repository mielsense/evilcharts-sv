import { getContext, setContext } from 'svelte';
import { RegistrationSet } from '../../ui/echarts-chart/index.js';
import type { RadialBarRegistration } from './types.js';

const RADIAL_CHART_CONTEXT = Symbol('evilcharts.echarts-radial-chart');

export class EChartsRadialChartContext {
	radialBars = new RegistrationSet<RadialBarRegistration>();
}

export function setEChartsRadialChartContext(): EChartsRadialChartContext {
	const context = new EChartsRadialChartContext();
	setContext(RADIAL_CHART_CONTEXT, context);
	return context;
}

export function useEChartsRadialChart(): EChartsRadialChartContext {
	const context = getContext<EChartsRadialChartContext | undefined>(RADIAL_CHART_CONTEXT);
	if (!context) {
		throw new Error('[EvilCharts] ECharts radial parts must be children of EChartsRadialChart.');
	}
	return context;
}
