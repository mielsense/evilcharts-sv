import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import Harness from './echarts-selection-accessibility.test.svelte';

const FAMILIES = ['area', 'line', 'bar', 'composed', 'pie', 'radar'] as const;
const DEDUPED_FAMILIES = ['area', 'line', 'bar', 'radar'] as const;

describe('ECharts selectable-series accessibility', () => {
	it.each(FAMILIES)('selects a clickable %s series without a legend', async (family) => {
		const { container } = render(Harness, { family });
		const controls = container.querySelector('[aria-label="Selectable chart series"]');
		await expect.poll(() => controls?.querySelectorAll('button').length).toBe(2);

		const first = controls?.querySelector('button') as HTMLButtonElement | null;
		expect(first).not.toBeNull();
		first?.focus();
		await userEvent.keyboard('{Enter}');

		await expect.poll(() => first?.getAttribute('aria-pressed')).toBe('true');
		await expect
			.poll(() => container.querySelector('[data-test="selection"]')?.textContent)
			.not.toBe('none');
	});

	it.each(DEDUPED_FAMILIES)('exposes one control per logical %s data key', async (family) => {
		const { container } = render(Harness, { family, duplicate: true });
		const controls = container.querySelector('[aria-label="Selectable chart series"]');

		await expect.poll(() => controls?.querySelectorAll('button').length).toBe(2);
		expect(
			[...(controls?.querySelectorAll('button') ?? [])].map((button) => button.textContent?.trim())
		).toEqual(['Desktop', 'Mobile']);
	});
});
