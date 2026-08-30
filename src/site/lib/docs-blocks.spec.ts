import { describe, expect, it } from 'vitest';
import { getPages } from './source.server.js';

const chartFamilies = ['area', 'line', 'bar', 'composed', 'radar', 'pie', 'radial', 'sankey'];

describe('chart block galleries', () => {
	it('publishes a block gallery for every family in both providers', () => {
		const urls = new Set(getPages().map((page) => page.url));

		for (const family of chartFamilies) {
			expect(urls, family).toContain(`/docs/layerchart/${family}-chart/blocks`);
			expect(urls, family).toContain(`/docs/echarts/${family}-chart/blocks`);
		}
	});
});
