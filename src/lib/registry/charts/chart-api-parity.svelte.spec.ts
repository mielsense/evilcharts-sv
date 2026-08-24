import { render } from 'vitest-browser-svelte';
import { describe, expect, it } from 'vitest';
import Harness from './chart-api-parity.test.svelte';

describe('canonical special-chart escape-hatch props', () => {
	it('forwards pieProps and labelListProps', async () => {
		const { container } = render(Harness);
		await expect
			.poll(() =>
				container.querySelector('[data-test="pie"] .lc-pie-arc')?.getAttribute('data-parity-prop')
			)
			.toBe('pie');
		await expect
			.poll(
				() => container.querySelector('[data-test="pie"] text')?.getAttribute('data-parity-label'),
				{ timeout: 3_000 }
			)
			.toBe('pie-label');
	});

	it('forwards radialBarProps', async () => {
		const { container } = render(Harness);
		await expect
			.poll(() =>
				container
					.querySelector('[data-test="radial"] .lc-arc-line')
					?.getAttribute('data-parity-prop')
			)
			.toBe('radial');
	});

	it('forwards sankeyProps', async () => {
		const { container } = render(Harness);
		await expect
			.poll(() =>
				container
					.querySelector('[data-test="sankey"] .lc-root-container')
					?.getAttribute('data-parity-prop')
			)
			.toBe('sankey');
	});
});
