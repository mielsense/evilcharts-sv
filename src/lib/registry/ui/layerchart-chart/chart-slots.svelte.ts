export type TooltipSlot = {
	variant?: 'default' | 'frosted-glass';
	roundness?: 'sm' | 'md' | 'lg' | 'xl';
	defaultIndex?: number;
	cursor?: boolean;
};

export type LegendSlot = {
	variant?:
		| 'square'
		| 'circle'
		| 'circle-outline'
		| 'rounded-square'
		| 'rounded-square-outline'
		| 'vertical-bar'
		| 'horizontal-bar';
	align?: 'left' | 'center' | 'right';
	verticalAlign?: 'top' | 'middle' | 'bottom';
	isClickable?: boolean;
};

/**
 * Reactive registrations for chart parts that render outside the plot SVG.
 *
 * A chart child records its tooltip or legend props here, and the root renders the matching HTML
 * layer in the correct place. Registrations use per-instance tokens because a chart subtree can
 * remount before the previous instance finishes tearing down. A stale cleanup must not clear the
 * newer live registration.
 */
export class ChartSlots {
	#tooltipToken: string | null = null;
	#legendToken: string | null = null;

	tooltip = $state<TooltipSlot | null>(null);
	legend = $state<LegendSlot | null>(null);

	registerTooltip(token: string, slot: TooltipSlot) {
		this.#tooltipToken = token;
		this.tooltip = slot;
	}

	unregisterTooltip(token: string) {
		if (this.#tooltipToken !== token) return;
		this.#tooltipToken = null;
		this.tooltip = null;
	}

	registerLegend(token: string, slot: LegendSlot) {
		this.#legendToken = token;
		this.legend = slot;
	}

	unregisterLegend(token: string) {
		if (this.#legendToken !== token) return;
		this.#legendToken = null;
		this.legend = null;
	}
}
