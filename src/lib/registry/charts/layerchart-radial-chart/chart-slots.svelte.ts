import type { TooltipRoundness, TooltipVariant } from '../../ui/layerchart-tooltip/index.js';
import type {
	ChartLegendVariant,
	LegendAlign,
	LegendVerticalAlign
} from '../../ui/layerchart-legend/index.js';

export type TooltipSlot = {
	variant?: TooltipVariant;
	roundness?: TooltipRoundness;
	defaultIndex?: number;
	cursor?: boolean;
};

export type LegendSlot = {
	variant?: ChartLegendVariant;
	align?: LegendAlign;
	verticalAlign?: LegendVerticalAlign;
	isClickable?: boolean;
};

/**
 * Registry for the chart parts that cannot render inside `<Svg>`.
 *
 * Recharts' `<Legend>` renders an HTML box that reserves layout space outside the SVG, and its
 * `<Tooltip>` renders a floating box; both are declared as chart children. LayerChart's
 * equivalents must sit outside `<Svg>` — the tooltip as a sibling of it, the legend outside the
 * chart entirely — so `<Tooltip />` and `<Legend />` register their props here and the root
 * renders them in the right place. The composed API is unchanged. See plans/DEVIATIONS.md A-2.
 *
 * Registration is keyed by a per-instance token: LayerChart's `<Chart>` wraps its content in
 * `{#key isMounted}`, so the subtree remounts once on mount and the *old* instance's teardown can
 * run after the *new* instance has registered. Ignoring a teardown whose token is stale keeps the
 * live registration intact. See plans/DEVIATIONS.md A-3.
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
