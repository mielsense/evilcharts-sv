import { getContext, setContext } from 'svelte';
import { RegistrationSet } from '../../ui/echarts-chart/index.js';
import type { DotVariant } from '../../ui/echarts-dot/index.js';

const RADAR_SLOTS_CONTEXT = Symbol('echarts-radar-slots');

type RadarSlots = {
	dots: RegistrationSet<{ variant: DotVariant }>;
	activeDots: RegistrationSet<{ variant: DotVariant }>;
};

export function setEChartsRadarSlots(): RadarSlots {
	const slots = {
		dots: new RegistrationSet<{ variant: DotVariant }>(),
		activeDots: new RegistrationSet<{ variant: DotVariant }>()
	};
	setContext(RADAR_SLOTS_CONTEXT, slots);
	return slots;
}

export function useEChartsRadarSlots(): RadarSlots {
	const slots = getContext<RadarSlots>(RADAR_SLOTS_CONTEXT);
	if (!slots) {
		throw new Error('[EvilCharts] ECharts Dot and ActiveDot must be nested inside Radar.');
	}
	return slots;
}
