import { MediaQuery } from 'svelte/reactivity';

/**
 * True while the viewport is narrower than `breakpoint`.
 *
 * The reference (`src/hooks/use-breakpoint.ts`) starts `undefined` and coerces to `false`
 * before the first effect runs, so it reads `false` during SSR and the initial paint.
 * `MediaQuery`'s `fallback` reproduces that.
 */
export function useBreakpoint(breakpoint: number) {
	return new MediaQuery(`max-width: ${breakpoint - 1}px`, false);
}
