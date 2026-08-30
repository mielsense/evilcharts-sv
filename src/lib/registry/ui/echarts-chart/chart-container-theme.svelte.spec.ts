import { render } from 'vitest-browser-svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Harness from './chart-container-theme.test.svelte';

const NativeMutationObserver = window.MutationObserver;
let observed: Array<{ target: Node; options: MutationObserverInit }> = [];
let disconnect = vi.fn();

class RecordingMutationObserver implements MutationObserver {
	disconnect() {
		disconnect();
	}
	observe(target: Node, options: MutationObserverInit) {
		observed.push({ target, options });
	}
	takeRecords() {
		return [];
	}
}

describe('ECharts ChartContainer theme invalidation', () => {
	afterEach(() => {
		window.MutationObserver = NativeMutationObserver;
		document.documentElement.classList.remove('echarts-theme-test');
	});

	it('invalidates for chart-host class/style and document theme mutations, but not descendants', async () => {
		const { container } = render(Harness);
		const host = container.querySelector<HTMLElement>('[data-chart]')!;
		const revision = () => Number(container.querySelector('[data-revision]')?.textContent);
		expect(revision()).toBe(0);

		host.classList.add('local-chart-theme');
		await expect.poll(revision).toBe(1);

		host.style.setProperty('--local-chart-color', '#00ff00');
		await expect.poll(revision).toBe(2);

		document.documentElement.classList.add('echarts-theme-test');
		await expect.poll(revision).toBe(3);

		container.querySelector<HTMLElement>('[data-descendant]')!.classList.add('ignored-change');
		await new Promise((resolve) => setTimeout(resolve, 50));
		expect(revision()).toBe(3);
	});

	it('observes only class/style attributes on both roots and disconnects on unmount', () => {
		observed = [];
		disconnect = vi.fn();
		window.MutationObserver = RecordingMutationObserver;

		const rendered = render(Harness);
		const host = rendered.container.querySelector('[data-chart]');

		expect(observed).toEqual([
			{
				target: document.documentElement,
				options: { attributes: true, attributeFilter: ['class', 'style'] }
			},
			{
				target: host,
				options: { attributes: true, attributeFilter: ['class', 'style'] }
			}
		]);

		rendered.unmount();
		expect(disconnect).toHaveBeenCalledOnce();
	});
});
