import { render } from 'vitest-browser-svelte';
import { describe, expect, it, vi } from 'vitest';
import ComponentPreview from './component-preview.svelte';

vi.mock('$env/dynamic/public', () => ({ env: {} }));

describe('ComponentPreview missing state', () => {
	it('offers one clear action when a registry entry is missing', () => {
		const { container } = render(ComponentPreview, { name: 'missing-registry-example' });

		expect(container.textContent).toContain('component is missing from the registry.');
		expect(container.textContent).not.toContain('Contact the developer');
		expect(container.querySelector('a')?.textContent).toBe('Open an issue');
	});
});
