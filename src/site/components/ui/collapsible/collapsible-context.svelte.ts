import { getContext, setContext } from 'svelte';

/**
 * Open/closed state for `<Collapsible>`.
 *
 * Base UI's primitive publishes `--collapsible-panel-height` and the `data-open` / `data-closed`
 * attributes the reference styles against; both are reproduced here.
 */
export class CollapsibleState {
	open = $state(false);

	toggle() {
		this.open = !this.open;
	}
}

const KEY = Symbol('evilcharts-collapsible');

export function setCollapsibleContext(state: CollapsibleState) {
	return setContext(KEY, state);
}

export function useCollapsible(): CollapsibleState {
	const state = getContext<CollapsibleState>(KEY);
	if (!state) throw new Error('Collapsible parts must be used inside <Collapsible>');
	return state;
}
