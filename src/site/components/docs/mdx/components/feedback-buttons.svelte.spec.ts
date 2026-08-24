import { render } from 'vitest-browser-svelte';
import { describe, expect, it, vi } from 'vitest';
import FeedbackButtons from './feedback-buttons.svelte';

vi.mock('$env/dynamic/public', () => ({ env: {} }));

describe('FeedbackButtons', () => {
	it('asks a concrete question with matching answers', () => {
		const { container } = render(FeedbackButtons);

		expect(container.textContent).toContain('Was this page helpful?');
		expect(
			[...container.querySelectorAll('button')].map((button) => button.textContent?.trim())
		).toEqual(['Yes', 'No']);
	});
});
