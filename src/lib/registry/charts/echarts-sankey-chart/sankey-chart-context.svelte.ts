import { getContext, setContext } from 'svelte';
import { RegistrationSet } from '../../ui/echarts-chart/index.js';
import type { LinkRegistration, NodeRegistration } from './types.js';

const SANKEY_CONTEXT = Symbol('evilcharts.echarts-sankey-chart');

export class EChartsSankeyChartContext {
	nodes = new RegistrationSet<NodeRegistration>();
	links = new RegistrationSet<LinkRegistration>();
}

export function setEChartsSankeyChartContext(): EChartsSankeyChartContext {
	const context = new EChartsSankeyChartContext();
	setContext(SANKEY_CONTEXT, context);
	return context;
}

export function useEChartsSankeyChart(): EChartsSankeyChartContext {
	const context = getContext<EChartsSankeyChartContext | undefined>(SANKEY_CONTEXT);
	if (!context)
		throw new Error('[EvilCharts] ECharts Sankey parts must be children of EChartsSankeyChart.');
	return context;
}
