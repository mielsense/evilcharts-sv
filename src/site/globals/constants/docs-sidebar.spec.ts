import { describe, expect, it } from 'vitest';
import { getStartedOptions } from './docs-sidebar.js';

describe('docs sidebar', () => {
	it('places the changelog at the bottom of Get Started', () => {
		expect(getStartedOptions('layerchart').at(-1)).toEqual({
			id: 'changelog',
			name: 'Changelog',
			url: '/docs/changelog'
		});
	});
});
