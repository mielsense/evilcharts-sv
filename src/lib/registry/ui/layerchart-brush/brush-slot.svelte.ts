import { getContext, setContext } from 'svelte';
import type { BrushProps } from './types.js';

const BRUSH_SLOT_KEY = Symbol('evilcharts.brush-slot');

/**
 * Registry for the declarative `<Chart.Brush />` child.
 *
 * The reference pulls the `<Brush>` element out of `children` with
 * `React.Children.toArray(...).find(...)`. Svelte cannot inspect a snippet, so the slot
 * registers itself into this context instead. Every cartesian chart root creates one.
 */
export class BrushSlotRegistry {
	#token: string | null = null;

	slot = $state<BrushProps | null>(null);

	get present() {
		return this.slot !== null;
	}

	/**
	 * Registration is keyed by a per-instance token: LayerChart's `<Chart>` wraps its content in
	 * `{#key isMounted}`, so the subtree remounts once on mount and the old instance's teardown can
	 * run after the new instance has registered. Ignoring a stale teardown keeps the live
	 * registration intact.
	 */
	register(token: string, props: BrushProps) {
		this.#token = token;
		this.slot = props;
	}

	unregister(token: string) {
		if (this.#token !== token) return;
		this.#token = null;
		this.slot = null;
	}
}

export function setBrushSlotContext() {
	const registry = new BrushSlotRegistry();
	setContext(BRUSH_SLOT_KEY, registry);
	return registry;
}

export function useBrushSlot() {
	const registry = getContext<BrushSlotRegistry | undefined>(BRUSH_SLOT_KEY);

	if (!registry) {
		throw new Error('<Brush /> must be used within an Evil chart root');
	}

	return registry;
}
