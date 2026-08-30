import { describe, expect, it } from 'vitest';
import { getStartedOptions } from './docs-sidebar.js';

describe('docs sidebar', () => {
	it('keeps the provider-neutral agent skill in Get Started', () => {
		for (const provider of ['layerchart', 'echarts'] as const) {
			expect(getStartedOptions(provider)).toContainEqual({
				id: 'agent-skill',
				name: 'Agent Skill',
				url: '/docs/agent-skill'
			});
		}
	});

	it('places the changelog at the bottom of Get Started', () => {
		expect(getStartedOptions('layerchart').at(-1)).toEqual({
			id: 'changelog',
			name: 'Changelog',
			url: '/docs/changelog'
		});
	});
});
