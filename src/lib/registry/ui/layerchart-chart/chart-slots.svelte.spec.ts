import { describe, expect, it } from 'vitest';
import { ChartSlots } from './chart-slots.svelte.js';

describe('ChartSlots', () => {
	it('ignores stale teardown after a slot remount', () => {
		const slots = new ChartSlots();
		const first = 'tooltip-before-remount';
		const live = 'tooltip-after-remount';

		slots.registerTooltip(first, { variant: 'default', cursor: true });
		slots.registerTooltip(live, { variant: 'frosted-glass', cursor: false });
		slots.unregisterTooltip(first);

		expect(slots.tooltip).toEqual({ variant: 'frosted-glass', cursor: false });

		slots.unregisterTooltip(live);
		expect(slots.tooltip).toBeNull();
	});

	it('tracks tooltip and legend lifecycles independently', () => {
		const slots = new ChartSlots();

		slots.registerTooltip('tooltip', { roundness: 'lg' });
		slots.registerLegend('legend', { align: 'right', verticalAlign: 'bottom' });
		slots.unregisterTooltip('tooltip');

		expect(slots.tooltip).toBeNull();
		expect(slots.legend).toEqual({ align: 'right', verticalAlign: 'bottom' });

		slots.unregisterLegend('legend');
		expect(slots.legend).toBeNull();
	});
});
