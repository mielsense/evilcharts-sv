import { getContext, setContext } from 'svelte';
import { browser } from '$app/environment';

/**
 * Ported from `evilcharts/src/components/ui/sidebar.tsx`'s `SidebarProvider` state.
 *
 * Same cookie name, max age, widths and keyboard shortcut. `useIsMobile` becomes the ported
 * `useMobile` hook, injected by the provider so this module stays free of component imports.
 */
export const SIDEBAR_COOKIE_NAME = 'sidebar_state';
export const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
export const SIDEBAR_WIDTH = '16rem';
export const SIDEBAR_WIDTH_MOBILE = '18rem';
export const SIDEBAR_WIDTH_ICON = '3rem';
export const SIDEBAR_KEYBOARD_SHORTCUT = 'b';

export class SidebarState {
	/** Desktop open/closed. Mirrored to a cookie so the choice survives a reload. */
	open = $state(true);
	openMobile = $state(false);
	/** Whether the viewport is below the mobile breakpoint; set by the provider. */
	isMobile = $state(false);

	#onOpenChange: ((open: boolean) => void) | undefined;

	constructor(defaultOpen = true, onOpenChange?: (open: boolean) => void) {
		this.open = defaultOpen;
		this.#onOpenChange = onOpenChange;
	}

	/** `data-state="expanded" | "collapsed"`, which is what the Tailwind classes select on. */
	get state(): 'expanded' | 'collapsed' {
		return this.open ? 'expanded' : 'collapsed';
	}

	setOpen(value: boolean) {
		this.open = value;
		this.#onOpenChange?.(value);
		if (browser) {
			document.cookie = `${SIDEBAR_COOKIE_NAME}=${value}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
		}
	}

	setOpenMobile(value: boolean) {
		this.openMobile = value;
	}

	toggleSidebar() {
		if (this.isMobile) this.setOpenMobile(!this.openMobile);
		else this.setOpen(!this.open);
	}
}

const KEY = Symbol('evilcharts-sidebar');

export function setSidebarContext(state: SidebarState) {
	return setContext(KEY, state);
}

export function useSidebar(): SidebarState {
	const state = getContext<SidebarState>(KEY);
	if (!state) throw new Error('useSidebar must be used within a SidebarProvider.');
	return state;
}
