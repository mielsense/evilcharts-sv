import { render } from 'vitest-browser-svelte';
import { describe, expect, it } from 'vitest';
import Harness from './selection-harness.spec.svelte';

/**
 * Regression guard: an in-markup `{const}` inside a keyed `{#each}` does not re-derive when an
 * outer prop changes, so per-row values must be computed in a single `$derived` list instead.
 * Both the legend and the tooltip resolve their rows that way. See plans/DEVIATIONS.md A-6.
 */
describe('legend selection reactivity', () => {
	it('dims the other entries when `selected` changes after mount', async () => {
		const { container } = render(Harness);
		const entries = () => container.querySelectorAll('.select-none > button');

		expect(entries()[1].className).not.toContain('opacity-30');

		(container.querySelector('[data-set]') as HTMLButtonElement).click();
		await new Promise((r) => setTimeout(r, 50));

		expect(entries()[0].className).not.toContain('opacity-30');
		expect(entries()[1].className).toContain('opacity-30');
	});

	it('clears the dimming when the entry is clicked again', async () => {
		const { container } = render(Harness);
		const entries = () => container.querySelectorAll('.select-none > button');

		(entries()[0] as HTMLButtonElement).click();
		await new Promise((r) => setTimeout(r, 50));
		expect(entries()[1].className).toContain('opacity-30');

		(entries()[0] as HTMLButtonElement).click();
		await new Promise((r) => setTimeout(r, 50));
		expect(entries()[1].className).not.toContain('opacity-30');
	});
});
