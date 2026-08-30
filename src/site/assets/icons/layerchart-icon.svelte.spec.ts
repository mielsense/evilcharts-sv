import { render } from 'vitest-browser-svelte';
import { describe, expect, it } from 'vitest';
import LayerChartIcon from './layerchart-icon.svelte';

describe('LayerChartIcon', () => {
	it('renders the official mark and forwards SVG attributes', () => {
		const { container } = render(LayerChartIcon, {
			class: 'text-layerchart',
			'aria-label': 'LayerChart'
		});
		const icon = container.querySelector('svg');

		expect(icon).not.toBeNull();
		expect(icon?.getAttribute('class')).toContain('text-layerchart');
		expect(icon?.getAttribute('aria-label')).toBe('LayerChart');
		expect(icon?.getAttribute('viewBox')).toBe('0 0 132 124');
		expect(icon?.querySelectorAll('path')).toHaveLength(7);
		expect(icon?.querySelector('path')?.getAttribute('d')).toBe(
			'M-1.004 972.8c.632 0 1.004.298 1.004.803v47.187c0 .61-.537 1.42-1.388 2.1-.85.68-1.868 1.11-2.628 1.11h-58.98c-.632 0-1.004-.3-1.004-.8v-47.187c0-.609.537-1.423 1.388-2.103.85-.68 1.868-1.11 2.628-1.11h58.98Z'
		);
	});
});
