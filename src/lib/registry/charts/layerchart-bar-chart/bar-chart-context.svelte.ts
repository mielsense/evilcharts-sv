import { getContext, setContext } from 'svelte';
import type { ChartConfig } from '../../ui/layerchart-chart/chart-config.js';
import type { DitherVariant, RenderStyle } from '../../ui/layerchart-dither/index.js';
import { ChartSlots } from '../../ui/layerchart-chart/chart-slots.svelte.js';
import type { BarAnimationType } from './types.js';

const BAR_CHART_KEY = Symbol('evilcharts.bar-chart');

type Options = {
	config: () => ChartConfig;
	/** Rows currently rendered by the chart (brush-filtered, or the loading skeleton). */
	data: () => Record<string, unknown>[];
	/** Resolved category key for the x scale. */
	xKey: () => string | undefined;
	/** Series keys rendered by the chart, in config order. */
	seriesKeys: () => string[];
	/** Data keys of the `<Bar />` children currently rendered, in registration order. */
	barKeys: () => string[];
	animationType: () => BarAnimationType;
	isStacked: () => boolean;
	isPercent: () => boolean;
	isHorizontal: () => boolean;
	barRadius: () => number;
	/** Gap between bars sharing a category, in pixels. Recharts' default is 4. */
	barGap: () => number | undefined;
	/** Gap on each side of a category. Recharts' default is `"10%"`. */
	barCategoryGap: () => number | undefined;
	/** Timestamp the chart mounted — anchors the one-shot grow-in. */
	introStartedAt: () => number;
	renderStyle: () => RenderStyle;
	ditherVariant: () => DitherVariant;
	/** Whether the pointer is currently over the chart. */
	isMouseInChart: () => boolean;
	/** The row the pointer is currently over, so a bar can tell if it is the active one. */
	activeRow: () => Record<string, unknown> | undefined;
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
	/**
	 * Called by each `<Bar />` so the root knows how many bars share a category.
	 *
	 * Recharts divides a category between the bars it finds in the tree; the port needs the same
	 * count to place them, so the bars announce themselves.
	 */
	registerBar: (token: string, dataKey: string | undefined, isClickable: boolean) => void;
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
 * Shared state for every part of the chart. Lifted into <EvilBarChart /> so that
 * <Bar />, <XAxis />, <Legend />, and friends can read it without prop drilling.
 * Sub-components are composed freely — the provider is the single source of truth.
 */
export class BarChartContext {
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
	get barKeys() {
		return this.#options.barKeys();
	}
	get animationType() {
		return this.#options.animationType();
	}
	get isStacked() {
		return this.#options.isStacked();
	}
	get isPercent() {
		return this.#options.isPercent();
	}
	get isHorizontal() {
		return this.#options.isHorizontal();
	}
	get barRadius() {
		return this.#options.barRadius();
	}
	get barGap() {
		return this.#options.barGap();
	}
	get barCategoryGap() {
		return this.#options.barCategoryGap();
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
	get isMouseInChart() {
		return this.#options.isMouseInChart();
	}
	get activeRow() {
		return this.#options.activeRow();
	}
	get dataLength() {
		return this.#options.data().length;
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

	registerBar = (token: string, dataKey: string | undefined, isClickable: boolean) => {
		this.#options.registerBar(token, dataKey, isClickable);
	};

	registerXAxisDataKey = (token: string, dataKey: string | undefined) => {
		this.#options.registerXAxisDataKey(token, dataKey);
	};

	registerAxis = (token: string, axis: 'x' | 'y', present: boolean) => {
		this.#options.registerAxis(token, axis, present);
	};
}

export function setBarChartContext(options: Options) {
	const context = new BarChartContext(options);
	setContext(BAR_CHART_KEY, context);
	return context;
}

/** Reads the chart context, throwing a helpful error when used outside <EvilBarChart /> */
export function useBarChart(): BarChartContext {
	const context = getContext<BarChartContext | undefined>(BAR_CHART_KEY);

	if (!context) {
		throw new Error('Bar chart parts (<Bar />, <XAxis />, …) must be used within <EvilBarChart />');
	}

	return context;
}
