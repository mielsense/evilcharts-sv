import { render } from 'vitest-browser-svelte';
import { describe, expect, it } from 'vitest';
import SvelteIcon from './svelte-icon.svelte';

describe('SvelteIcon', () => {
	it('renders the Svelte mark with the inherited brand color', () => {
		const { container } = render(SvelteIcon, { class: 'text-[#ff3e00]' });
		const icon = container.querySelector('svg');

		expect(icon?.dataset.icon).toBe('svelte');
		expect(icon?.getAttribute('class')).toContain('text-[#ff3e00]');
		expect(icon?.querySelector('path')?.getAttribute('fill')).toBe('currentColor');
	});
});
