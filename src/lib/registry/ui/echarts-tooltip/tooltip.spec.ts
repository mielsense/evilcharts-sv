import { describe, expect, it } from 'vitest';
import {
	escapeTooltipHtml,
	resolveTooltipPosition,
	tooltipBaseOption,
	tooltipRow,
	tooltipShell
} from './tooltip.js';

describe('ECharts tooltip helpers', () => {
	it('escapes every user-authored field before returning formatter HTML', () => {
		expect(escapeTooltipHtml(`<img src=x onerror="alert('x')"> &`)).toBe(
			'&lt;img src=x onerror=&quot;alert(&#039;x&#039;)&quot;&gt; &amp;'
		);
		expect(
			tooltipRow({ indicatorHtml: '<i></i>', labelText: '<label>', valueText: '1 & 2', dimmed: '' })
		).toContain('&lt;label&gt;');
		expect(
			tooltipShell({ label: '<title>', body: 'safe', roundness: 'lg', variant: 'default' })
		).toContain('&lt;title&gt;');
	});

	it('matches variable and fixed positioning semantics', () => {
		expect(resolveTooltipPosition('variable')).toBeUndefined();
		const fixed = resolveTooltipPosition('fixed');
		expect(typeof fixed).toBe('function');
		if (typeof fixed === 'function') {
			expect(
				fixed([100, 40], [], {} as HTMLDivElement, null, {
					viewSize: [320, 200],
					contentSize: [80, 40]
				})
			).toEqual([60, 8]);
		}
	});

	it('builds the reference cursor without ECharts tooltip chrome', () => {
		expect(
			tooltipBaseOption({
				present: true,
				cursor: true,
				position: 'variable',
				axisPointerColor: 'rgba(1, 2, 3, 0.4)',
				strokeWidth: 2
			})
		).toMatchObject({
			show: true,
			trigger: 'axis',
			confine: true,
			backgroundColor: 'transparent',
			borderWidth: 0,
			axisPointer: {
				type: 'line',
				lineStyle: { color: 'rgba(1, 2, 3, 0.4)', width: 2, type: [3, 3] }
			}
		});
	});
});
