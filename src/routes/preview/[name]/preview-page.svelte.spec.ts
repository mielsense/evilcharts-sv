import { render } from 'vitest-browser-svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { tick } from 'svelte';
import { registryComponents } from '$lib/registry/components.js';
import PreviewA from '$site/components/docs/charts/component-preview-a.fixture.svelte';
import PreviewPage from './+page.svelte';
import { routePage, setRouteName } from './preview-page-state.fixture.svelte.js';

vi.mock('$app/state', async () => {
	const { routePage } = await import('./preview-page-state.fixture.svelte.js');
	return { page: routePage };
});

const testNames = [
	'preview-route-ready-test',
	'preview-route-missing-test',
	'preview-route-retry-test',
	'preview-route-pending-test'
] as const;

function deferred<T>() {
	let resolve!: (value: T) => void;
	const promise = new Promise<T>((resolvePromise) => {
		resolve = resolvePromise;
	});
	return { promise, resolve };
}

afterEach(() => {
	for (const name of testNames) delete registryComponents[name];
});

describe('standalone preview lazy loading', () => {
	it('marks a loaded preview ready', async () => {
		setRouteName('preview-route-ready-test');
		registryComponents['preview-route-ready-test'] = () => Promise.resolve({ default: PreviewA });

		const { container } = render(PreviewPage);

		await expect
			.poll(() =>
				container.querySelector('[data-slot="preview"]')?.getAttribute('data-preview-ready')
			)
			.toBe('true');
		expect(container.querySelector('[data-preview-error]')).toBeNull();
	});

	it('marks a missing registry entry as a terminal error', async () => {
		setRouteName('preview-route-missing-test');

		const { container } = render(PreviewPage);

		await expect
			.poll(() =>
				container.querySelector('[data-slot="preview"]')?.getAttribute('data-preview-error')
			)
			.toBe('missing');
		expect(container.textContent).toContain('not found in registry');
	});

	it('marks a failed chunk as terminal and retries it', async () => {
		setRouteName('preview-route-retry-test');
		let attempts = 0;
		registryComponents['preview-route-retry-test'] = () => {
			attempts += 1;
			return attempts === 1
				? Promise.reject(new Error('private standalone chunk URL'))
				: Promise.resolve({ default: PreviewA });
		};

		const { container } = render(PreviewPage);

		await expect
			.poll(() =>
				container.querySelector('[data-slot="preview"]')?.getAttribute('data-preview-error')
			)
			.toBe('failed');
		expect(container.textContent).not.toContain('private standalone chunk URL');

		container.querySelector<HTMLButtonElement>('button')?.click();

		await expect
			.poll(() =>
				container.querySelector('[data-slot="preview"]')?.getAttribute('data-preview-ready')
			)
			.toBe('true');
		expect(container.querySelector('[data-preview-error]')).toBeNull();
	});

	it.each(['missing', 'failed'] as const)(
		'clears a stale %s marker when navigation starts a pending preview',
		async (terminalState) => {
			setRouteName(
				terminalState === 'missing' ? 'preview-route-missing-test' : 'preview-route-retry-test'
			);
			if (terminalState === 'failed') {
				registryComponents['preview-route-retry-test'] = () =>
					Promise.reject(new Error('private old route chunk URL'));
			}

			const { container } = render(PreviewPage);
			await expect
				.poll(() =>
					container.querySelector('[data-slot="preview"]')?.getAttribute('data-preview-error')
				)
				.toBe(terminalState);
			const terminalName = container.querySelector('code');
			expect(terminalName?.textContent).toBe(routePage.params.name);

			const pending = deferred<{ default: typeof PreviewA }>();
			registryComponents['preview-route-pending-test'] = () => pending.promise;
			setRouteName('preview-route-pending-test');
			await tick();

			expect(routePage.params.name).toBe('preview-route-pending-test');
			expect(container.querySelector('[data-preview-error]')).toBeNull();
			expect(container.textContent).not.toContain('not found in registry');
			expect(container.textContent).not.toContain('could not be loaded');
			expect(terminalName?.textContent).not.toBe('preview-route-pending-test');

			pending.resolve({ default: PreviewA });
		}
	);
});
