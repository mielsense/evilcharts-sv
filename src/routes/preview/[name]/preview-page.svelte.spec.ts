import { render } from 'vitest-browser-svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { registryComponents } from '$lib/registry/components.js';
import PreviewA from '$site/components/docs/charts/component-preview-a.fixture.svelte';
import PreviewPage from './+page.svelte';

const routePage = vi.hoisted(() => ({
	params: { name: 'preview-route-ready-test' },
	url: new URL('http://localhost/preview/preview-route-ready-test')
}));

vi.mock('$app/state', () => ({ page: routePage }));

const testNames = [
	'preview-route-ready-test',
	'preview-route-missing-test',
	'preview-route-retry-test'
] as const;

function setRouteName(name: (typeof testNames)[number]) {
	routePage.params.name = name;
	routePage.url = new URL(`http://localhost/preview/${name}`);
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
});
