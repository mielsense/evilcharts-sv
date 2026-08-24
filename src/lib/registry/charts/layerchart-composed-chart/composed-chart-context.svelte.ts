import { getContext, setContext } from 'svelte';
import type { ChartConfig } from '../../ui/layerchart-chart/chart-config.js';
import type { DitherVariant, RenderStyle } from '../../ui/layerchart-dither/index.js';
import { ChartSlots } from './chart-slots.svelte.js';
import type { ComposedAnimationType, CurveType } from './types.js';

const COMPOSED_CHART_KEY = Symbol('evilcharts.composed-chart');

type Options = {
	config: () => ChartConfig;
	/** Rows currently rendered by the chart (brush-filtered, or the loading skeleton). */
	data: () => Record<string, unknown>[];
	/** Resolved category key for the band scale. */
	xKey: () => string | undefined;
	/** Series keys rendered by the chart, in config order. */
	seriesKeys: () => string[];
	/** Data keys of the `<Bar />` children currently rendered, in registration order. */
	barKeys: () => string[];
	curveType: () => CurveType;
	animationType: () => ComposedAnimationType;
	/** Gap between bars sharing a category, in pixels. Recharts' default is 4. */
	barGap: () => number | undefined;
	/** Gap on each side of a category. Recharts' default is `"10%"`. */
	barCategoryGap: () => number | undefined;
	/** Timestamp the chart mounted — anchors the one-shot intro. */
	introStartedAt: () => number;
	renderStyle: () => RenderStyle;
	ditherVariant: () => DitherVariant;
	isLoading: () => boolean;
	/** Data index currently hovered, or null when none. */
	hoveredIndex: () => number | null;
	chartId: () => string;
	selectedDataKey: () => string | null;
	selectDataKey: (dataKey: string | null) => void;
	/**
	 * Called by each `<Bar />` so the root knows how many bars share a category.
	 *
	 * Recharts divides a category between the bars it finds in the tree; LayerChart needs the
	 * sub-band domain up front, so the bars announce themselves and the root derives it.
	 */
	registerBar: (token: string, dataKey: string | undefined) => void;
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
 * Shared state for every part of the chart. Lifted into <EvilComposedChart /> so
 * that <Bar />, <Line />, <XAxis />, <Legend />, and friends can read it without
 * prop drilling. Sub-components are composed freely — the provider is the single
 * source of truth.
 */
export class ComposedChartContext {
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
	get curveType() {
		return this.#options.curveType();
	}
	get animationType() {
		return this.#options.animationType();
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
	get dataLength() {
		return this.#options.data().length;
	}
	get isLoading() {
		return this.#options.isLoading();
	}
	get hoveredIndex() {
		return this.#options.hoveredIndex();
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

	registerBar = (token: string, dataKey: string | undefined) => {
		this.#options.registerBar(token, dataKey);
	};

	registerXAxisDataKey = (token: string, dataKey: string | undefined) => {
		this.#options.registerXAxisDataKey(token, dataKey);
	};

	registerAxis = (token: string, axis: 'x' | 'y', present: boolean) => {
		this.#options.registerAxis(token, axis, present);
	};
}

export function setComposedChartContext(options: Options) {
	const context = new ComposedChartContext(options);
	setContext(COMPOSED_CHART_KEY, context);
	return context;
}

/** Reads the chart context, throwing a helpful error when used outside <EvilComposedChart /> */
export function useComposedChart(): ComposedChartContext {
	const context = getContext<ComposedChartContext | undefined>(COMPOSED_CHART_KEY);

	if (!context) {
		throw new Error(
			'Composed chart parts (<Bar />, <Line />, <XAxis />, …) must be used within <EvilComposedChart />'
		);
	}

	return context;
}
