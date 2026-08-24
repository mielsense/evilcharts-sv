import { getContext, setContext } from 'svelte';
import type { DotVariant } from '../../ui/layerchart-dot/types.js';

const AREA_SLOTS_KEY = Symbol('evilcharts.area-slots');

/**
 * Registry for the `<Dot />` / `<ActiveDot />` children of one `<Area />`.
 *
 * The reference resolves them with `React.Children.forEach`; Svelte cannot inspect a
 * snippet, so each slot registers itself here instead — the config-slot pattern from
 * plans/SPEC.md §4.2.
 */
export class AreaSlots {
	#dotToken: string | null = null;
	#activeDotToken: string | null = null;

	dot = $state<{ variant?: DotVariant } | null>(null);
	activeDot = $state<{ variant?: DotVariant } | null>(null);

	/** Token-keyed so a remount's stale teardown cannot clear the live slot (DEVIATIONS.md A-3). */
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

export function setAreaSlotsContext() {
	const slots = new AreaSlots();
	setContext(AREA_SLOTS_KEY, slots);
	return slots;
}

export function useAreaSlots(): AreaSlots {
	const slots = getContext<AreaSlots | undefined>(AREA_SLOTS_KEY);

	if (!slots) {
		throw new Error('<Dot /> and <ActiveDot /> must be composed inside an <Area />');
	}

	return slots;
}
