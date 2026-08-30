import { getContext, setContext } from 'svelte';

export type EChartsSharedSlotName = 'tooltip' | 'legend' | 'brush';

type SharedSlotContext = {
	register: (
		slot: EChartsSharedSlotName,
		token: string,
		getter: () => unknown
	) => () => void;
};

const ECHARTS_SHARED_SLOT_CONTEXT = Symbol('evilcharts-echarts-shared-slots');

export function setEChartsSharedSlotContext(context: SharedSlotContext): SharedSlotContext {
	setContext(ECHARTS_SHARED_SLOT_CONTEXT, context);
	return context;
}

export function getEChartsSharedSlotContext(): SharedSlotContext {
	const context = getContext<SharedSlotContext | undefined>(ECHARTS_SHARED_SLOT_CONTEXT);
	if (!context) {
		throw new Error('[EvilCharts] ECharts compound parts must be children of an ECharts chart.');
	}
	return context;
}

