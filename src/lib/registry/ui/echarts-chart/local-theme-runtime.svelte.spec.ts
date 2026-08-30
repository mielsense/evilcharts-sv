import { render } from 'vitest-browser-svelte';
import { describe, expect, it } from 'vitest';
import Harness from './local-theme-runtime.test.svelte';

function hasStroke(container: HTMLElement, color: string) {
	return [...container.querySelectorAll('[data-slot="echarts-host"] path')].some(
		(path) => path.getAttribute('stroke') === color
	);
}

describe('ECharts chart-local theme updates', () => {
	it('re-resolves class and inline colors without replacing the chart host', async () => {
		const { container } = render(Harness);
		const chartRoot = container.querySelector<HTMLElement>('[data-chart]')!;
		const chartHost = container.querySelector<HTMLElement>('[data-slot="echarts-host"]')!;
		await expect.poll(() => hasStroke(container, 'rgb(255,0,0)')).toBe(true);
		const svg = chartHost.querySelector('svg');
		expect(svg).not.toBeNull();

		container.querySelector<HTMLButtonElement>('[data-local-theme]')!.click();

		await expect
			.poll(() => getComputedStyle(chartRoot).getPropertyValue('--color-desktop-0').trim())
			.toBe('#0000ff');
		await expect.poll(() => hasStroke(container, 'rgb(0,0,255)')).toBe(true);
		expect(container.querySelector('[data-chart]')).toBe(chartRoot);
		expect(container.querySelector('[data-slot="echarts-host"]')).toBe(chartHost);
		expect(chartHost.querySelector('svg')).toBe(svg);

		chartRoot.style.setProperty('--color-desktop-0', '#00ff00', 'important');

		await expect.poll(() => hasStroke(container, 'rgb(0,255,0)')).toBe(true);
		expect(container.querySelector('[data-slot="echarts-host"]')).toBe(chartHost);
		expect(chartHost.querySelector('svg')).toBe(svg);
	});
});
