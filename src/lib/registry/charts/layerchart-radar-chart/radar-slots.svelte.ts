import { getContext, setContext } from 'svelte';
import type { DotVariant } from '../../ui/layerchart-dot/types.js';

const RADAR_SLOTS_KEY = Symbol('evilcharts.radar-slots');

/**
 * Registry for the `<Dot />` / `<ActiveDot />` children of one `<Radar />`.
 *
 * The reference resolves them with `React.Children.forEach`; Svelte cannot inspect a
 * snippet, so each slot registers itself here instead.
 */
export class RadarSlots {
	#dotToken: string | null = null;
	#activeDotToken: string | null = null;

	dot = $state<{ variant?: DotVariant } | null>(null);
	activeDot = $state<{ variant?: DotVariant } | null>(null);

	/** Token-keyed so a remount's stale teardown cannot clear the live slot. */
	registerDot(token: string, variant: DotVariant | undefined) {
		this.#dotToken = token;
		this.dot = { variant };
	}

	unregisterDot(token: string) {
		if (this.#dotToken !== token) return;
		this.#dotToken = null;
		this.dot = null;
	}

	registerActiveDot(token: string, variant: DotVariant | undefined) {
		this.#activeDotToken = token;
		this.activeDot = { variant };
	}

	unregisterActiveDot(token: string) {
		if (this.#activeDotToken !== token) return;
		this.#activeDotToken = null;
		this.activeDot = null;
	}
}

export function setRadarSlotsContext() {
	const slots = new RadarSlots();
	setContext(RADAR_SLOTS_KEY, slots);
	return slots;
}

export function useRadarSlots(): RadarSlots {
	const slots = getContext<RadarSlots | undefined>(RADAR_SLOTS_KEY);

	if (!slots) {
		throw new Error('<Dot /> and <ActiveDot /> must be composed inside a <Radar />');
	}

	return slots;
}
