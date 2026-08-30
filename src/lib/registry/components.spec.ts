import { describe, expect, it } from 'vitest';
import { getRegistryComponent } from './components.js';

describe('registry component loaders', () => {
	it.each([
		'ex-area-chart',
		'ex-echarts-area-chart',
		'audience-area-chart',
		'audience-echarts-area-chart'
	])('loads the provider preview for %s', (name) => {
		expect(getRegistryComponent(name)).toBeTypeOf('function');
	});

	it('does not manufacture a loader for an unknown item', () => {
		expect(getRegistryComponent('missing-registry-item')).toBeUndefined();
	});
});
