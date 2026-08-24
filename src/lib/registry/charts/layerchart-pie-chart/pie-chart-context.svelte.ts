import { getContext, setContext } from 'svelte';
import type { ChartConfig } from '../../ui/layerchart-chart/chart-config.js';
import type { DitherVariant, RenderStyle } from '../../ui/layerchart-dither/index.js';
import { ChartSlots } from './chart-slots.svelte.js';

const PIE_CHART_KEY = Symbol('evilcharts.pie-chart');

type Options = {
	config: () => ChartConfig;
	/** Rows rendered by the chart. */
	data: () => Record<string, unknown>[];
	/** Key holding each sector's numeric value. */
	dataKey: () => string;
	/** Key holding each sector's name. */
	nameKey: () => string;
	isLoading: () => boolean;
	introStartedAt: () => number;
	renderStyle: () => RenderStyle;
	ditherVariant: () => DitherVariant;
	selectedSector: () => string | null;
	selectSector: (sectorName: string | null) => void;
};

/**
 * Shared state for every part of the chart. Lifted into <EvilPieChart /> so that
 * <Pie />, <Tooltip />, <Legend />, and friends can read it without prop drilling.
 * Sub-components are composed freely — the provider is the single source of truth.
 */
export class PieChartContext {
	#options: Options;

	/** Parts that render outside `<Svg>` — see `ChartSlots`. */
	slots = new ChartSlots();

	constructor(options: Options) {
		this.#options = options;
	}

	get config() {
		return this.#options.config();
	}
	get data() {
		return this.#options.data();
	}
	get dataKey() {
		return this.#options.dataKey();
	}
	get nameKey() {
		return this.#options.nameKey();
	}
	get isLoading() {
		return this.#options.isLoading();
	}
	get introStartedAt() {
		return this.#options.introStartedAt();
	}
	get renderStyle() {
		return this.#options.renderStyle();
	}
	get ditherVariant() {
		return this.#options.ditherVariant();
	}
	get selectedSector() {
		return this.#options.selectedSector();
	}

	selectSector = (sectorName: string | null) => {
		this.#options.selectSector(sectorName);
	};
}

export function setPieChartContext(options: Options) {
	const context = new PieChartContext(options);
	setContext(PIE_CHART_KEY, context);
	return context;
}

/** Reads the chart context, throwing a helpful error when used outside <EvilPieChart /> */
export function usePieChart(): PieChartContext {
	const context = getContext<PieChartContext | undefined>(PIE_CHART_KEY);

	if (!context) {
		throw new Error(
			'Pie chart parts (<Pie />, <Tooltip />, …) must be used within <EvilPieChart />'
		);
	}

	return context;
}
