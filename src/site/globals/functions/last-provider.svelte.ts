/**
 * Ported from `evilcharts/src/globals/functions/useLastProvider.ts`.
 *
 * Shared pages (`/docs`, `/docs/chart-config`) belong to no provider, but the sidebar should keep
 * showing the engine the reader was last in. That history lives in a module singleton mirrored to
 * localStorage, so it survives client-side navigation (the singleton) and hard reloads (storage).
 * React's `useSyncExternalStore` becomes a `$state` rune, which needs no subscription plumbing.
 */
import { browser } from '$app/environment';
import {
	PROVIDERS,
	PROVIDER_STORAGE_KEY,
	type Provider
} from '$site/globals/constants/providers.js';

function readStorage(): Provider | null {
	try {
		const stored = localStorage.getItem(PROVIDER_STORAGE_KEY);
		return PROVIDERS.includes(stored as Provider) ? (stored as Provider) : null;
	} catch {
		return null;
	}
}

// The server has no history; callers fall back to the default provider, and the stored value is
// reconciled in after hydration.
const store = $state<{ value: Provider | null }>({ value: browser ? readStorage() : null });

export function useLastProvider(): Provider | null {
	return store.value;
}

export function rememberProvider(provider: Provider) {
	if (store.value === provider) return;
	store.value = provider;
	if (!browser) return;
	try {
		localStorage.setItem(PROVIDER_STORAGE_KEY, provider);
	} catch {
		// Storage unavailable — in-session stickiness still works.
	}
}
