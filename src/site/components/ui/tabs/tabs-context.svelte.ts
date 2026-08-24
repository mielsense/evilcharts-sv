import { getContext, setContext } from 'svelte';

export type TabsOrientation = 'horizontal' | 'vertical';

/**
 * Shared tab state.
 *
 * Base UI's `<Tabs.Root>` owns this for the reference and publishes the active tab's box as
 * `--active-tab-{width,height,left,bottom}` CSS variables, which `<Tabs.Indicator>` then reads.
 * bits-ui has no indicator primitive, so the box is measured here and the same four variables are
 * published — keeping the reference's indicator class strings working unchanged.
 * See plans/DEVIATIONS.md D-2.
 */
export class TabsState {
	value = $state('');
	orientation: TabsOrientation = $state('horizontal');
	onValueChange: ((value: string) => void) | undefined;

	/** The active tab's box, relative to the list. */
	box = $state<{ width: number; height: number; left: number; bottom: number } | null>(null);

	select(next: string) {
		this.value = next;
		this.onValueChange?.(next);
	}
}

const KEY = Symbol('evilcharts-tabs');

export function setTabsContext(state: TabsState) {
	return setContext(KEY, state);
}

export function useTabs(): TabsState {
	const state = getContext<TabsState>(KEY);
	if (!state) throw new Error('Tabs parts must be used inside <Tabs>');
	return state;
}
