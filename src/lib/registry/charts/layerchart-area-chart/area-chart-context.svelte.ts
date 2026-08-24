import { getContext, setContext } from 'svelte';
import type { ChartConfig } from '../../ui/layerchart-chart/chart-config.js';
import { ChartSlots } from './chart-slots.svelte.js';
import type { AreaAnimationType, CurveType } from './types.js';

const AREA_CHART_KEY = Symbol('evilcharts.area-chart');

type Options = {
	config: () => ChartConfig;
	/** Rows currently rendered by the chart (brush-filtered, or the loading skeleton). */
	data: () => Record<string, unknown>[];
	/** Resolved category key for the x scale. */
	xKey: () => string | undefined;
	/** Series keys rendered by the chart, in config order. */
	seriesKeys: () => string[];
	curveType: () => CurveType;
	animationType: () => AreaAnimationType;
	introStartedAt: () => number;
	isStacked: () => boolean;
	isExpanded: () => boolean;
	isLoading: () => boolean;
	chartId: () => string;
	selectedDataKey: () => string | null;
	selectDataKey: (dataKey: string | null) => void;
	/**
	 * Called by `<XAxis dataKey>` on mount.
	 *
	 * Recharts reads the category key off `<XAxis dataKey>`; LayerChart needs it on the root's
	 * `x` accessor, so the axis pushes it up rather than the root reading down. Keeping the
	 * state on the root avoids a circular dependency between `xKey` and this context.
	 */
	registerXAxisDataKey: (token: string, dataKey: string | undefined) => void;
	/**
	 * Called by `<XAxis />` / `<YAxis />` so the root can reserve plot-area space for them.
	 *
	 * Recharts sizes the plot from the axes it renders (default chart margin 5 on every side, plus
	 * a 30px band for an `<XAxis>` and a 60px gutter for a `<YAxis>`). LayerChart takes `padding`
	 * as a single explicit value, so the axes announce themselves and the root derives it.
	 */
	registerAxis: (token: string, axis: 'x' | 'y', present: boolean) => void;
};

/**
 * Shared state for every part of the chart. Lifted into <EvilAreaChart /> so that
 * <Area />, <XAxis />, <Legend />, and friends can read it without prop drilling.
 * Sub-components are composed freely — the provider is the single source of truth.
 */
export class AreaChartContext {
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
	get xKey() {
		return this.#options.xKey();
	}
	get seriesKeys() {
		return this.#options.seriesKeys();
	}
	get curveType() {
		return this.#options.curveType();
	}
	get animationType() {
		return this.#options.animationType();
	}
	get introStartedAt() {
		return this.#options.introStartedAt();
	}
	get isStacked() {
		return this.#options.isStacked();
	}
	get isExpanded() {
		return this.#options.isExpanded();
	}
	get isLoading() {
		return this.#options.isLoading();
	}
	get chartId() {
		return this.#options.chartId();
	}
	get selectedDataKey() {
		return this.#options.selectedDataKey();
	}

	selectDataKey = (dataKey: string | null) => {
		this.#options.selectDataKey(dataKey);
	};

	registerXAxisDataKey = (token: string, dataKey: string | undefined) => {
		this.#options.registerXAxisDataKey(token, dataKey);
	};

	registerAxis = (token: string, axis: 'x' | 'y', present: boolean) => {
		this.#options.registerAxis(token, axis, present);
	};
}

export function setAreaChartContext(options: Options) {
	const context = new AreaChartContext(options);
	setContext(AREA_CHART_KEY, context);
	return context;
}

/** Reads the chart context, throwing a helpful error when used outside <EvilAreaChart /> */
export function useAreaChart(): AreaChartContext {
	const context = getContext<AreaChartContext | undefined>(AREA_CHART_KEY);

	if (!context) {
		throw new Error(
			'Area chart parts (<Area />, <XAxis />, …) must be used within <EvilAreaChart />'
		);
	}

	return context;
}
