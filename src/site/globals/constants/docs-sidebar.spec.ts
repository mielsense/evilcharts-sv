import { describe, expect, it } from 'vitest';
import { DocumentationOptions, getStartedOptions } from './docs-sidebar.js';

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

	it('places the changelog at the bottom of Documentation', () => {
		expect(getStartedOptions('layerchart')).not.toContainEqual({
			id: 'changelog',
			name: 'Changelog',
			url: '/docs/changelog'
		});
		expect(DocumentationOptions.at(-1)).toEqual({
			id: 'changelog',
			name: 'Changelog',
			url: '/docs/changelog'
		});
	});
});
