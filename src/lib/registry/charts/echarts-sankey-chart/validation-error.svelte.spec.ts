import { render } from 'vitest-browser-svelte';
import { describe, expect, it } from 'vitest';
import Harness from './validation-error.test.svelte';

describe('ECharts Sankey validation errors', () => {
	it('renders empty chart data for a recognized validation error', () => {
		const { container } = render(Harness);

		expect(container.querySelector('[data-chart]')).not.toBeNull();
		expect(container.querySelectorAll('button')).toHaveLength(0);
	});

	it('does not swallow unexpected data errors', () => {
		let thrown: unknown;
		try {
			render(Harness, { unexpected: true });
		} catch (error) {
			thrown = error;
		}

		expect(thrown).toBeInstanceOf(RangeError);
		expect((thrown as RangeError).message).toContain('Unexpected data failure.');
	});
});
