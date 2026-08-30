import { describe, expect, it } from 'vitest';
import { getPages } from './source.server.js';

const chartFamilies = ['area', 'line', 'bar', 'composed', 'radar', 'pie', 'radial', 'sankey'];

describe('chart block galleries', () => {
	it('publishes every provider block gallery that has upstream blocks', () => {
		const urls = new Set(getPages().map((page) => page.url));

		for (const family of chartFamilies) {
			expect(urls, family).toContain(`/docs/layerchart/${family}-chart/blocks`);
		}
		for (const family of ['area', 'line', 'bar', 'pie', 'radial', 'sankey']) {
			expect(urls, family).toContain(`/docs/echarts/${family}-chart/blocks`);
		}
		for (const family of ['composed', 'radar']) {
			expect(urls, family).not.toContain(`/docs/echarts/${family}-chart/blocks`);
		}
	});
});
