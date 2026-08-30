import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import ControlledHarness from './echarts-controlled-selection.test.svelte';
import Harness from './echarts-selection-accessibility.test.svelte';

const FAMILIES = [
	['area', 'Selectable chart series', 'desktop'],
	['line', 'Selectable chart series', 'desktop'],
	['bar', 'Selectable chart series', 'desktop'],
	['composed', 'Selectable chart series', 'desktop'],
	['pie', 'Selectable chart series', 'chrome'],
	['radar', 'Selectable chart series', 'desktop'],
	['radial', 'Chart values', 'chrome'],
	['sankey', 'Chart values', 'desktop']
] as const;
const DEDUPED_FAMILIES = ['area', 'line', 'bar', 'radar'] as const;
const CONTROLLED_FAMILIES = [
	['area', 'Mobile', 'Desktop', 'desktop'],
	['pie', 'Safari', 'Chrome', 'chrome']
] as const;

function selectableControls(container: HTMLElement, ariaLabel: string) {
	return container.querySelector(`[aria-label="${ariaLabel}"]`);
}

function chartControl(container: HTMLElement, label: string) {
	return [
		...container.querySelectorAll<HTMLButtonElement>(
			'[aria-label="Selectable chart series"] button'
		)
	].find((button) => button.textContent?.trim() === label)!;
}

describe('ECharts selectable-series accessibility', () => {
	it.each(FAMILIES)(
		'selects and deselects a clickable %s item without a legend',
		async (family, ariaLabel, selectedKey) => {
			const { container } = render(Harness, { family });
			await expect
				.poll(() => selectableControls(container, ariaLabel)?.querySelectorAll('button').length)
				.toBe(2);

			const controls = selectableControls(container, ariaLabel);
			const first = controls?.querySelector('button') as HTMLButtonElement | null;
			expect(first).not.toBeNull();
			first?.focus();
			await userEvent.keyboard('{Enter}');

			await expect.poll(() => first?.getAttribute('aria-pressed')).toBe('true');
			await expect
				.poll(() => container.querySelector('[data-test="selection"]')?.textContent)
				.toBe(selectedKey);

			first?.click();
			await expect.poll(() => first?.getAttribute('aria-pressed')).toBe('false');
			await expect
				.poll(() => container.querySelector('[data-test="selection"]')?.textContent)
				.toBe('none');
		}
	);

	it.each(DEDUPED_FAMILIES)('exposes one control per logical %s data key', async (family) => {
		const { container } = render(Harness, { family, duplicate: true });
		const controls = container.querySelector('[aria-label="Selectable chart series"]');

		await expect.poll(() => controls?.querySelectorAll('button').length).toBe(2);
		expect(
			[...(controls?.querySelectorAll('button') ?? [])].map((button) => button.textContent?.trim())
		).toEqual(['Desktop', 'Mobile']);
	});

	it.each(CONTROLLED_FAMILIES)(
		'keeps the controlled %s selection effective until its public prop changes',
		async (family, initialLabel, targetLabel, targetKey) => {
			const { container } = render(ControlledHarness, { family });
			await expect
				.poll(
					() => container.querySelectorAll('[aria-label="Selectable chart series"] button').length
				)
				.toBe(2);

			const root = container.querySelector('[data-slot="echarts-host"]');
			expect(root).not.toBeNull();
			expect(chartControl(container, initialLabel).getAttribute('aria-pressed')).toBe('true');

			chartControl(container, targetLabel).click();
			await expect
				.poll(() => container.querySelector('[data-callback]')?.textContent)
				.toBe(targetKey);
			expect(chartControl(container, initialLabel).getAttribute('aria-pressed')).toBe('true');
			expect(chartControl(container, targetLabel).getAttribute('aria-pressed')).toBe('false');

			container.querySelector<HTMLButtonElement>('[data-select="target"]')!.click();
			await expect
				.poll(() => chartControl(container, targetLabel).getAttribute('aria-pressed'))
				.toBe('true');
			expect(chartControl(container, initialLabel).getAttribute('aria-pressed')).toBe('false');
			expect(container.querySelector('[data-slot="echarts-host"]')).toBe(root);

			chartControl(container, targetLabel).click();
			await expect.poll(() => container.querySelector('[data-callback]')?.textContent).toBe('none');
			expect(chartControl(container, targetLabel).getAttribute('aria-pressed')).toBe('true');

			container.querySelector<HTMLButtonElement>('[data-select="none"]')!.click();
			await expect
				.poll(() => chartControl(container, targetLabel).getAttribute('aria-pressed'))
				.toBe('false');
			expect(chartControl(container, initialLabel).getAttribute('aria-pressed')).toBe('false');
			expect(container.querySelector('[data-slot="echarts-host"]')).toBe(root);
		}
	);
});
