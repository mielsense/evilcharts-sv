import { getContext, setContext } from 'svelte';
import { RegistrationSet } from '../../ui/echarts-chart/index.js';
import type { LabelRegistration } from './types.js';

const PIE_SLOTS_CONTEXT = Symbol('evilcharts.echarts-pie-slots');

export class EChartsPieSlots {
	labels = new RegistrationSet<LabelRegistration>();
}

export function setEChartsPieSlots(): EChartsPieSlots {
	const context = new EChartsPieSlots();
	setContext(PIE_SLOTS_CONTEXT, context);
	return context;
}

export function useEChartsPieSlots(): EChartsPieSlots {
	const context = getContext<EChartsPieSlots | undefined>(PIE_SLOTS_CONTEXT);
	if (!context) throw new Error('[EvilCharts] ECharts Label must be nested inside Pie.');
	return context;
}
