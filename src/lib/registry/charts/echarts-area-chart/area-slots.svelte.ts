import { getContext, setContext } from 'svelte';
import { RegistrationSet } from '../../ui/echarts-chart/index.js';
import type { DotVariant } from '../../ui/echarts-dot/index.js';

type DotRegistration = { variant: DotVariant };
const CONTEXT = Symbol('evilcharts.echarts-area-slots');

export class EChartsAreaSlots {
	dots = new RegistrationSet<DotRegistration>();
	activeDots = new RegistrationSet<DotRegistration>();
}

export function setEChartsAreaSlots(): EChartsAreaSlots {
	const context = new EChartsAreaSlots();
	setContext(CONTEXT, context);
	return context;
}

export function useEChartsAreaSlots(): EChartsAreaSlots {
	const context = getContext<EChartsAreaSlots | undefined>(CONTEXT);
	if (!context) throw new Error('[EvilCharts] ECharts Dot must be nested inside Area.');
	return context;
}
