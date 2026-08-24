import { MediaQuery } from 'svelte/reactivity';

const MOBILE_BREAKPOINT = 940;

export function useIsMobile() {
	return new MediaQuery(`max-width: ${MOBILE_BREAKPOINT - 1}px`, false);
}
