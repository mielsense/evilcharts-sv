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
		expect(
			Array.from(icon?.querySelectorAll('path') ?? [], (path) => [
				path.getAttribute('d'),
				path.getAttribute('transform')
			])
		).toEqual([
			[
				'M-1.004 972.8c.632 0 1.004.298 1.004.803v47.187c0 .61-.537 1.42-1.388 2.1-.85.68-1.868 1.11-2.628 1.11h-58.98c-.632 0-1.004-.3-1.004-.8v-47.187c0-.609.537-1.423 1.388-2.103.85-.68 1.868-1.11 2.628-1.11h58.98Z',
				'rotate(-26.565 -1546.131 1919.596) skewX(36.87)'
			],
			[
				'M-1.004 972.8c.632 0 1.004.298 1.004.803v47.187c0 .61-.537 1.42-1.388 2.1-.85.68-1.868 1.11-2.628 1.11h-58.98c-.632 0-1.004-.3-1.004-.8v-47.187c0-.609.537-1.423 1.388-2.103.85-.68 1.868-1.11 2.628-1.11h58.98Z',
				'rotate(-26.565 -1586.546 1910.056) skewX(36.87)'
			],
			[
				'M-1.004 972.8c.632 0 1.004.298 1.004.803v47.187c0 .61-.537 1.42-1.388 2.1-.85.68-1.868 1.11-2.628 1.11h-58.98c-.632 0-1.004-.3-1.004-.8v-47.187c0-.609.537-1.423 1.388-2.103.85-.68 1.868-1.11 2.628-1.11h58.98Z',
				'rotate(-26.565 -1626.96 1900.515) skewX(36.87)'
			],
			[
				'm1335.68 438.866 38.16-19.082 38.16 19.082M1335.68 457.947l19.08-9.541M1412 457.947l-19.08-9.541',
				'translate(-1307.917 -383.848)'
			],
			['m1354.76 448.406 19.08-9.54 19.08 9.54', 'translate(-1307.917 -383.848)'],
			[
				'm1545.57 183.996-65.42 32.711v57.243l65.42 32.711 65.42-32.711v-57.243l-65.42-32.711Z',
				'translate(-1479.647 -183.496)'
			],
			[
				'm1480.15 216.707 65.42 32.71 65.42-32.71M1545.57 306.661v-57.244',
				'translate(-1479.647 -183.496)'
			]
		]);
	});
});
