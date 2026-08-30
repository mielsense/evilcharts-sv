import { getContext, setContext } from 'svelte';
import { RegistrationSet } from '../../ui/echarts-chart/index.js';
import type { NodeLabelRegistration } from './types.js';

const NODE_SLOTS = Symbol('evilcharts.echarts-sankey-node');

export class EChartsSankeyNodeSlots {
	labels = new RegistrationSet<NodeLabelRegistration>();
}

export function setEChartsSankeyNodeSlots(): EChartsSankeyNodeSlots {
	const context = new EChartsSankeyNodeSlots();
	setContext(NODE_SLOTS, context);
	return context;
}

export function useEChartsSankeyNodeSlots(): EChartsSankeyNodeSlots {
	const context = getContext<EChartsSankeyNodeSlots | undefined>(NODE_SLOTS);
	if (!context) throw new Error('[EvilCharts] ECharts NodeLabel must be nested inside Node.');
	return context;
}
