import { describe, expect, it } from 'vitest';
import { findNeighbour, flattenTree } from './source.js';

describe('docs neighbours', () => {
	it('publishes the changelog in the docs tree', () => {
		const urls = flattenTree().map((page) => page.url);

		expect(urls).toContain('/docs/changelog');
	});

	it('contains each canonical URL once', () => {
		const urls = flattenTree().map((page) => page.url);

		expect(new Set(urls).size).toBe(urls.length);
	});

	it('moves between chart landing pages without returning the current page', () => {
		const { previous, next } = findNeighbour('/docs/layerchart/line-chart');

		expect(previous?.url).toBe('/docs/layerchart/area-chart');
		expect(next?.url).toBe('/docs/layerchart/bar-chart');
	});

	it('keeps block galleries in their local page sequence', () => {
		const { previous, next } = findNeighbour('/docs/layerchart/line-chart/blocks');

		expect(previous?.url).toBe('/docs/layerchart/line-chart');
		expect(next?.url).toBe('/docs/layerchart/bar-chart');
	});

	it('does not return a neighbour outside the first or last entry', () => {
		const urls = flattenTree().map((page) => page.url);

		expect(findNeighbour(urls[0]).previous).toBeUndefined();
		expect(findNeighbour(urls.at(-1)!).next).toBeUndefined();
	});
});
