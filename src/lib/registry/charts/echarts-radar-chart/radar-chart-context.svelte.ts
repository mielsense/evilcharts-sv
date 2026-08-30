import { getContext, setContext } from 'svelte';
import { RegistrationSet } from '../../ui/echarts-chart/index.js';
import type { AngleAxisRegistration, GridRegistration, RadarRegistration } from './types.js';

const RADAR_CHART_CONTEXT = Symbol('echarts-radar-chart');

export type EChartsRadarChartContext = {
	radars: RegistrationSet<RadarRegistration>;
	grids: RegistrationSet<GridRegistration>;
	angleAxes: RegistrationSet<AngleAxisRegistration>;
	radiusAxes: RegistrationSet<true>;
};

export function setEChartsRadarChartContext(): EChartsRadarChartContext {
	const context = {
		radars: new RegistrationSet<RadarRegistration>(),
		grids: new RegistrationSet<GridRegistration>(),
		angleAxes: new RegistrationSet<AngleAxisRegistration>(),
		radiusAxes: new RegistrationSet<true>()
	};
	setContext(RADAR_CHART_CONTEXT, context);
	return context;
}

export function useEChartsRadarChart(): EChartsRadarChartContext {
	const context = getContext<EChartsRadarChartContext | undefined>(RADAR_CHART_CONTEXT);
	if (!context) {
		throw new Error('[EvilCharts] ECharts radar parts must be children of EChartsRadarChart.');
	}
	return context;
}
