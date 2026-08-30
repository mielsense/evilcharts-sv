import { render } from 'vitest-browser-svelte';
import { describe, expect, it } from 'vitest';
import Background from './background.svelte';

describe('radial background patterns', () => {
	it('matches the upstream overlapping-circle path geometry', () => {
		const { container } = render(Background, { variant: 'overlapping-circles' });
		const pattern = container.querySelector('pattern');
		expect(pattern).toMatchObject({
			id: expect.stringContaining('overlapping-circles')
		});
		expect(pattern?.getAttribute('width')).toBe('40');
		expect(pattern?.getAttribute('height')).toBe('40');
		expect(pattern?.querySelectorAll('path')).toHaveLength(1);
		expect(pattern?.querySelectorAll('circle')).toHaveLength(0);
	});

	it.each([
		['wiggle-lines', '52', '26', 'scale(0.6)'],
		['bubbles', '100', '100', 'scale(0.6667)']
	] as const)('matches the upstream %s tile geometry', (variant, width, height, transform) => {
		const { container } = render(Background, { variant });
		const pattern = container.querySelector('pattern');
		expect(pattern?.getAttribute('width')).toBe(width);
		expect(pattern?.getAttribute('height')).toBe(height);
		expect(pattern?.getAttribute('patternTransform')).toBe(transform);
		expect(pattern?.querySelectorAll('path')).toHaveLength(1);
	});

	it('uses a user-space fade mask like the upstream SVG', () => {
		const { container } = render(Background, { variant: 'dots' });
		expect(container.querySelector('mask')?.getAttribute('maskUnits')).toBe('userSpaceOnUse');
	});
});
