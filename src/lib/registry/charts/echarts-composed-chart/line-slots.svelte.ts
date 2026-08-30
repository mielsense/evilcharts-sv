import { getContext, setContext } from 'svelte';
import { RegistrationSet } from '../../ui/echarts-chart/index.js';
import type { DotVariant } from '../../ui/echarts-dot/index.js';
type DotRegistration = { variant: DotVariant };
const CONTEXT = Symbol('echarts-composed-line-slots');
class Slots {
	dots = new RegistrationSet<DotRegistration>();
	activeDots = new RegistrationSet<DotRegistration>();
}
export function setEChartsComposedLineSlots() {
	const value = new Slots();
	setContext(CONTEXT, value);
	return value;
}
export function useEChartsComposedLineSlots() {
	const value = getContext<Slots | undefined>(CONTEXT);
	if (!value)
		throw new Error('[EvilCharts] Dot parts must be children of EChartsComposedChart.Line.');
	return value;
}
