import { render } from 'vitest-browser-svelte';
import { describe, expect, it } from 'vitest';
import Harness from '../../../registry-tests/echarts-brush-controls.test.svelte';

function press(element: Element, key: string) {
	element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
}

describe('ECharts brush keyboard controls', () => {
	it('moves each edge with Arrow, Home, and End while preserving a valid range', async () => {
		const { container } = render(Harness);
		const start = container.querySelector('[aria-label="Range start"]');
		const end = container.querySelector('[aria-label="Range end"]');
		const value = () => container.querySelector('[data-test="range"]')?.textContent;
		expect(start).not.toBeNull();
		expect(end).not.toBeNull();

		press(start!, 'ArrowRight');
		await expect.poll(value).toBe('2:3');
		press(start!, 'Home');
		await expect.poll(value).toBe('0:3');
		press(end!, 'Home');
		await expect.poll(value).toBe('0:1');
		press(end!, 'End');
		await expect.poll(value).toBe('0:4');
	});

	it('pans the selected range with Arrow, Home, and End', async () => {
		const { container } = render(Harness);
		const range = container.querySelector('[aria-label="Selected chart range"]');
		const value = () => container.querySelector('[data-test="range"]')?.textContent;
		expect(range).not.toBeNull();

		press(range!, 'End');
		await expect.poll(value).toBe('2:4');
		press(range!, 'ArrowLeft');
		await expect.poll(value).toBe('1:3');
		press(range!, 'Home');
		await expect.poll(value).toBe('0:2');
	});
});
