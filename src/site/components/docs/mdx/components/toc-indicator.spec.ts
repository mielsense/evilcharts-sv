import { describe, expect, it } from 'vitest';
import type { TocEntry } from '$site/lib/source.js';
import { generatePathData, selectActiveHeading } from './toc-indicator.svelte.js';

const toc: TocEntry[] = [
	{ title: 'Install', url: '#install', depth: 2 },
	{ title: 'Usage', url: '#usage', depth: 3 },
	{ title: 'API', url: '#api', depth: 2 }
];

describe('table of contents geometry', () => {
	it('places each active distance at the measured row centre', () => {
		const geometry = generatePathData(toc, [
			{ top: 8, height: 20 },
			{ top: 36, height: 40 },
			{ top: 84, height: 20 }
		]);

		expect(geometry.itemCenterDistances).toEqual([18, 60.8062484748657, 103.6124969497314]);
	});

	it('chooses the last heading above the docs header offset', () => {
		expect(
			selectActiveHeading(
				['install', 'usage', 'api'],
				[
					{ id: 'install', top: -120 },
					{ id: 'usage', top: 70 },
					{ id: 'api', top: 430 }
				],
				96
			)
		).toBe('usage');
	});

	it('has no active heading before the first heading reaches the offset', () => {
		expect(
			selectActiveHeading(
				['install', 'usage'],
				[
					{ id: 'install', top: 180 },
					{ id: 'usage', top: 420 }
				],
				96
			)
		).toBeNull();
	});
});
