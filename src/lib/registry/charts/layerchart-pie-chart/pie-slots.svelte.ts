import { getContext, setContext } from 'svelte';

const PIE_SLOTS_KEY = Symbol('evilcharts.pie-slots');

export type LabelSlot = {
	/** Data key for the label text — defaults to the pie's value key. */
	dataKey?: string;
	/** Escape hatch for raw label props. */
	labelProps?: Record<string, unknown>;
};

/**
 * Registry for the `<Label />` child of one `<Pie />`.
 *
 * The reference resolves it with `React.Children.forEach`; Svelte cannot inspect a snippet, so
 * the slot registers itself here instead — the config-slot pattern from plans/SPEC.md §4.2.
 * Token-keyed so a remount's stale teardown cannot clear the live slot (DEVIATIONS.md A-3).
 */
export class PieSlots {
	#labelToken: string | null = null;

	label = $state<LabelSlot | null>(null);

	registerLabel(token: string, slot: LabelSlot) {
		this.#labelToken = token;
		this.label = slot;
	}

	unregisterLabel(token: string) {
		if (this.#labelToken !== token) return;
		this.#labelToken = null;
		this.label = null;
	}
}

export function setPieSlotsContext() {
	const slots = new PieSlots();
	setContext(PIE_SLOTS_KEY, slots);
	return slots;
}

export function usePieSlots(): PieSlots {
	const slots = getContext<PieSlots | undefined>(PIE_SLOTS_KEY);

	if (!slots) {
		throw new Error('<Label /> must be composed inside a <Pie />');
	}

	return slots;
}
