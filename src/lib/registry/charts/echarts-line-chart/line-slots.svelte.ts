import { getContext, setContext } from 'svelte';
import { RegistrationSet } from '../../ui/echarts-chart/index.js';
import type { DotVariant } from '../../ui/echarts-dot/index.js';

type DotRegistration = { variant: DotVariant };

export class EChartsLineSlots {
	dots = new RegistrationSet<DotRegistration>();
	activeDots = new RegistrationSet<DotRegistration>();
}

const LINE_SLOTS_CONTEXT = Symbol('evilcharts.echarts-line-slots');

export function setEChartsLineSlots(): EChartsLineSlots {
	const context = new EChartsLineSlots();
	setContext(LINE_SLOTS_CONTEXT, context);
	return context;
}

export function useEChartsLineSlots(): EChartsLineSlots {
	const context = getContext<EChartsLineSlots | undefined>(LINE_SLOTS_CONTEXT);
	if (!context) throw new Error('[EvilCharts] ECharts Dot must be nested inside Line.');
	return context;
}
