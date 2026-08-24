import { describe, expect, it } from 'vitest';
import { buildDocsPrompt } from './docs-prompt.js';

describe('buildDocsPrompt', () => {
	it('names EvilCharts and asks for concrete help in plain language', () => {
		expect(buildDocsPrompt('https://example.com/docs/chart-config')).toBe(
			"I'm reading this EvilCharts page: https://example.com/docs/chart-config\n" +
				'Use it to explain the relevant concepts and examples. Help me debug my code if I share it.'
		);
	});
});
