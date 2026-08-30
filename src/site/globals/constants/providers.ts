// The rendering engine a chart is built on. EvilCharts ships one registry item per chart and
// provider, so this is an install-time choice rather than a runtime prop.
//
// Docs mirror that split: everything provider-specific lives under /docs/<provider>/*.
// The exceptions are the intro (/docs) and Chart Config (/docs/chart-config), which
// documents the one contract every engine shares.

export const PROVIDERS = ['layerchart', 'echarts'] as const;

export type Provider = (typeof PROVIDERS)[number];

// Which engine the docs lead with for a first-time reader — the switcher falls back to
// this on shared pages when there's no remembered provider yet. Agent surfaces don't use
// it; they cite whichever provider is actually installable (see lib/agent-docs.ts).
export const DEFAULT_PROVIDER: Provider = 'layerchart';

interface ProviderMeta {
	/** Folder name under content/docs, and the URL segment. */
	id: Provider;
	/** Display name, as the upstream project spells it. */
	name: string;
	/** One-line pitch shown under the name in the switcher. */
	tagline: string;
	/** Charts aren't installable until the provider ships; gates the "Soon" badge. */
	available: boolean;
}

// Icons live in the switcher rather than here — this module is imported by build
// tooling that can't resolve components.

export const PROVIDER_META: Record<Provider, ProviderMeta> = {
	layerchart: {
		id: 'layerchart',
		name: 'LayerChart',
		tagline: 'SVG charts rendered by Svelte',
		available: true
	},
	echarts: {
		id: 'echarts',
		name: 'ECharts',
		tagline: 'Canvas and SVG charts powered by ECharts',
		available: true
	}
};

// localStorage key remembering the last provider the reader was in, so shared
// pages (/docs, /docs/chart-config) keep the switcher on their engine across reloads.
export const PROVIDER_STORAGE_KEY = 'evilcharts-provider';

export function providerHref(provider: Provider) {
	// The shared intro lives at /docs and covers every engine, so no provider
	// carries an index page — switching lands on that engine's components overview.
	return `/docs/${provider}/components`;
}

/**
 * Resolve the active provider from a pathname.
 *
 * Returns null on shared pages such as /docs and /docs/chart-config. Their callers can then use
 * the reader's remembered provider, falling back to DEFAULT_PROVIDER on a first visit.
 */
export function providerFromPathname(pathname: string): Provider | null {
	const segment = pathname.split('/').filter(Boolean)[1];
	return PROVIDERS.includes(segment as Provider) ? (segment as Provider) : null;
}
