import { getContext, setContext } from 'svelte';
import type { ChartConfig } from '../../ui/layerchart-chart/chart-config.js';
import { ChartSlots } from '../../ui/layerchart-chart/chart-slots.svelte.js';
import type { RadialVariant } from './types.js';

const RADIAL_CHART_KEY = Symbol('evilcharts.radial-chart');

type Options = {
	config: () => ChartConfig;
	/** Rows currently rendered by the chart, or the loading skeleton. */
	data: () => Record<string, unknown>[];
	/** Data key holding each bar's name. */
	nameKey: () => string;
	/**
	 * Value key, pushed up by the rendered `<RadialBar dataKey>`.
	 *
	 * Recharts reads it off the bar; the tooltip needs it too, so the bar registers it rather than
	 * the root guessing. The token prevents a stale teardown from clearing a remounted bar.
	 */
	valueKey: () => string | undefined;
	registerValueKey: (token: string, dataKey: string | undefined) => void;
	chartId: () => string;
	variant: () => RadialVariant;
	/** Value a full sweep represents; unset lets the largest row fill the arc. */
	max: () => number | undefined;
	innerRadius: () => number | string;
	outerRadius: () => number | string;
	isLoading: () => boolean;
	selectedBar: () => string | null;
	selectBar: (barName: string | null, value?: number) => void;
};

/**
 * Shared state for every part of the chart. Lifted into <EvilRadialChart /> so that
 * <RadialBar />, <Tooltip />, and <Legend /> can read it without prop drilling.
 */
export class RadialChartContext {
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
	get nameKey() {
		return this.#options.nameKey();
	}
	get valueKey() {
		return this.#options.valueKey();
	}
	get chartId() {
		return this.#options.chartId();
	}
	get variant() {
		return this.#options.variant();
	}
	get max() {
		return this.#options.max();
	}
	get innerRadius() {
		return this.#options.innerRadius();
	}
	get outerRadius() {
		return this.#options.outerRadius();
	}
	get isLoading() {
		return this.#options.isLoading();
	}
	get selectedBar() {
		return this.#options.selectedBar();
	}

	selectBar = (barName: string | null, value?: number) => {
		this.#options.selectBar(barName, value);
	};

	registerValueKey = (token: string, dataKey: string | undefined) => {
		this.#options.registerValueKey(token, dataKey);
	};
}

export function setRadialChartContext(options: Options) {
	const context = new RadialChartContext(options);
	setContext(RADIAL_CHART_KEY, context);
	return context;
}

/** Reads the chart context, throwing a helpful error when used outside <EvilRadialChart /> */
export function useRadialChart(): RadialChartContext {
	const context = getContext<RadialChartContext | undefined>(RADIAL_CHART_KEY);

	if (!context) {
		throw new Error(
			'Radial chart parts (<RadialBar />, <Tooltip />, …) must be used within <EvilRadialChart />'
		);
	}

	return context;
}
