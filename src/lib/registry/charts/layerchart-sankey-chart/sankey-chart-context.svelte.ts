import { getContext, setContext } from 'svelte';
import type { ChartConfig } from '../../ui/layerchart-chart/chart-config.js';
import { ChartSlots } from '../../ui/layerchart-chart/chart-slots.svelte.js';
import type { SankeyData } from './layout.js';

const SANKEY_CHART_KEY = Symbol('evilcharts.sankey-chart');

type Options = {
	/** The nodes + links rendered by the chart. */
	data: () => SankeyData;
	/** Colors + labels keyed by node name. */
	config: () => ChartConfig;
	/** Selector-safe id scoping this chart's SVG defs. */
	chartId: () => string;
	isLoading: () => boolean;
	selectedNode: () => string | null;
	selectNode: (nodeName: string | null) => void;
};

/**
 * Shared state for every part of the chart. Lifted into <EvilSankeyChart /> so that <Node />,
 * <Link />, and <Tooltip /> can read it without prop drilling. A sankey chart's data is rigid — the
 * root lays out `nodes`/`links` itself — so the parts here configure how those render.
 */
export class SankeyChartContext {
	#options: Options;

	/** Parts that render outside `<Svg>` — see `ChartSlots`. */
	slots = new ChartSlots();

	constructor(options: Options) {
		this.#options = options;
	}

	get data() {
		return this.#options.data();
	}
	get config() {
		return this.#options.config();
	}
	get chartId() {
		return this.#options.chartId();
	}
	get isLoading() {
		return this.#options.isLoading();
	}
	get selectedNode() {
		return this.#options.selectedNode();
	}

	selectNode = (nodeName: string | null) => {
		this.#options.selectNode(nodeName);
	};
}

export function setSankeyChartContext(options: Options) {
	const context = new SankeyChartContext(options);
	setContext(SANKEY_CHART_KEY, context);
	return context;
}

/** Reads the chart context, throwing a helpful error when used outside <EvilSankeyChart /> */
export function useSankeyChart(): SankeyChartContext {
	const context = getContext<SankeyChartContext | undefined>(SANKEY_CHART_KEY);

	if (!context) {
		throw new Error(
			'Sankey chart parts (<Node />, <Link />, <Tooltip />, …) must be used within <EvilSankeyChart />'
		);
	}

	return context;
}
