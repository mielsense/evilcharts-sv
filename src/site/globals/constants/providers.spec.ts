import { describe, expect, it } from 'vitest';
import {
	DEFAULT_PROVIDER,
	PROVIDERS,
	PROVIDER_META,
	providerFromPathname,
	providerHref
} from './providers.js';

describe('chart providers', () => {
	it('ships both providers and leads shared pages with LayerChart', () => {
		expect(PROVIDERS).toEqual(['layerchart', 'echarts']);
		expect(DEFAULT_PROVIDER).toBe('layerchart');
		for (const provider of PROVIDERS) expect(PROVIDER_META[provider].available).toBe(true);
	});

	it.each(PROVIDERS)('routes %s to its component guide', (provider) => {
		expect(providerHref(provider)).toBe(`/docs/${provider}/components`);
		expect(providerFromPathname(`/docs/${provider}/area-chart`)).toBe(provider);
	});

	it('does not invent a provider on shared or unknown paths', () => {
		expect(providerFromPathname('/docs/chart-config')).toBeNull();
		expect(providerFromPathname('/docs/unknown/area-chart')).toBeNull();
	});
});
