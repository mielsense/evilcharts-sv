import { render } from 'vitest-browser-svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { tick, type Component } from 'svelte';
import { registryComponents } from '$lib/registry/components.js';
import PreviewA from './component-preview-a.fixture.svelte';
import PreviewB from './component-preview-b.fixture.svelte';
import ComponentPreview from './component-preview.svelte';

vi.mock('$env/dynamic/public', () => ({ env: {} }));

type LoadedModule = { default: Component<Record<string, never>> };

const testNames = [
	'component-preview-retry-test',
	'component-preview-old-resolve-test',
	'component-preview-old-reject-test'
] as const;

function deferred<T>() {
	let resolve!: (value: T) => void;
	let reject!: (reason?: unknown) => void;
	const promise = new Promise<T>((resolvePromise, rejectPromise) => {
		resolve = resolvePromise;
		reject = rejectPromise;
	});

	return { promise, resolve, reject };
}

afterEach(() => {
	for (const name of testNames) delete registryComponents[name];
});

describe('ComponentPreview lazy loading', () => {
	it('offers one clear action when a registry entry is missing', () => {
		const { container } = render(ComponentPreview, { name: 'missing-registry-example' });

		expect(container.textContent).toContain('component is missing from the registry.');
		expect(container.textContent).not.toContain('Contact the developer');
		expect(container.querySelector('a')?.textContent).toBe('Open an issue');
		expect(container.querySelector('button')).toBeNull();
	});

	it('shows a bounded failure and retries the loader', async () => {
		let attempts = 0;
		registryComponents['component-preview-retry-test'] = () => {
			attempts += 1;
			return attempts === 1
				? Promise.reject(new Error('private chunk URL'))
				: Promise.resolve({ default: PreviewA });
		};

		const { container } = render(ComponentPreview, { name: 'component-preview-retry-test' });

		await expect.poll(() => container.textContent).toContain('could not be loaded');
		expect(container.textContent).not.toContain('private chunk URL');

		container.querySelector<HTMLButtonElement>('button')?.click();

		await expect
			.poll(() => container.querySelector('[data-preview-fixture="a"]')?.textContent)
			.toBe('Loaded preview A');
	});

	it.each([
		['resolve', 'component-preview-old-resolve-test'],
		['reject', 'component-preview-old-reject-test']
	] as const)('ignores a late %s after the preview name changes', async (settlement, oldName) => {
		const oldLoad = deferred<LoadedModule>();
		registryComponents[oldName] = () => oldLoad.promise;
		registryComponents['component-preview-retry-test'] = () =>
			Promise.resolve({ default: PreviewB });

		const { container, rerender } = render(ComponentPreview, { name: oldName });
		await rerender({ name: 'component-preview-retry-test' });
		await expect
			.poll(() => container.querySelector('[data-preview-fixture="b"]')?.textContent)
			.toBe('Loaded preview B');

		if (settlement === 'resolve') {
			oldLoad.resolve({ default: PreviewA });
		} else {
			oldLoad.reject(new Error('private stale chunk URL'));
		}

		await tick();
		expect(container.querySelector('[data-preview-fixture="b"]')?.textContent).toBe(
			'Loaded preview B'
		);
		expect(container.textContent).not.toContain('could not be loaded');
	});
});
