import { describe, expect, it } from 'vitest';
import { resolveDitherColor } from './color.js';

describe('dither color resolution', () => {
	it('resolves ChartConfig custom properties at paint time', () => {
		const values = new Map([
			['--color-desktop', 'oklch(0.72 0.18 160)'],
			['--color-mobile', 'var(--brand-mobile)'],
			['--brand-mobile', '#ff3e00']
		]);
		const readVariable = (name: string) => values.get(name) ?? '';

		expect(resolveDitherColor('var(--color-desktop)', readVariable)).toBe('oklch(0.72 0.18 160)');
		expect(resolveDitherColor('var(--color-mobile)', readVariable)).toBe('#ff3e00');
	});

	it('uses nested CSS variable fallbacks when a theme token is absent', () => {
		const readVariable = () => '';

		expect(resolveDitherColor('var(--chart-accent, var(--fallback, #f97316))', readVariable)).toBe(
			'#f97316'
		);
	});

	it('rejects empty values and cycles instead of handing canvas an invalid fill', () => {
		const readVariable = (name: string) =>
			name === '--a' ? 'var(--b)' : name === '--b' ? 'var(--a)' : '';

		expect(resolveDitherColor('', readVariable)).toBeNull();
		expect(resolveDitherColor('var(--missing)', readVariable)).toBeNull();
		expect(resolveDitherColor('var(--a)', readVariable)).toBeNull();
		expect(resolveDitherColor('rgb(10 20 30 / 40%)', readVariable)).toBe('rgb(10 20 30 / 40%)');
	});
});
