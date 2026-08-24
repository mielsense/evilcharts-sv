import { getContext, setContext } from 'svelte';
import type { ChartConfig } from '../../ui/layerchart-chart/chart-config.js';
import type { DitherVariant, RenderStyle } from '../../ui/layerchart-dither/index.js';
import { ChartSlots } from './chart-slots.svelte.js';

const RADAR_CHART_KEY = Symbol('evilcharts.radar-chart');

type Options = {
	config: () => ChartConfig;
	/** Rows currently rendered by the chart, or the loading skeleton. */
	data: () => Record<string, unknown>[];
	/** Series keys rendered by the chart, in config order. */
	seriesKeys: () => string[];
	/** Category key pushed up by `<PolarAngleAxis dataKey>`. */
	angleKey: () => string | undefined;
	isLoading: () => boolean;
	introStartedAt: () => number;
	renderStyle: () => RenderStyle;
	ditherVariant: () => DitherVariant;
	selectedDataKey: () => string | null;
	selectDataKey: (dataKey: string | null) => void;
	/**
	 * Called by `<PolarAngleAxis dataKey>` on mount.
	 *
	 * Recharts reads the category key off the angle axis; LayerChart needs it on the root's `x`
	 * accessor, so the axis pushes it up rather than the root reading down.
	 */
	registerAngleDataKey: (token: string, dataKey: string | undefined) => void;
};

/**
 * Shared state for every part of the chart. Lifted into <EvilRadarChart /> so that
 * <Radar />, <PolarAngleAxis />, <Legend />, and friends can read it without prop
 * drilling. Sub-components are composed freely — the provider is the single source
 * of truth.
 */
export class RadarChartContext {
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
	get seriesKeys() {
		return this.#options.seriesKeys();
	}
	get angleKey() {
		return this.#options.angleKey();
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
	get selectedDataKey() {
		return this.#options.selectedDataKey();
	}

	selectDataKey = (dataKey: string | null) => {
		this.#options.selectDataKey(dataKey);
	};

	registerAngleDataKey = (token: string, dataKey: string | undefined) => {
		this.#options.registerAngleDataKey(token, dataKey);
	};
}

export function setRadarChartContext(options: Options) {
	const context = new RadarChartContext(options);
	setContext(RADAR_CHART_KEY, context);
	return context;
}

/** Reads the chart context, throwing a helpful error when used outside <EvilRadarChart /> */
export function useRadarChart(): RadarChartContext {
	const context = getContext<RadarChartContext | undefined>(RADAR_CHART_KEY);

	if (!context) {
		throw new Error(
			'Radar chart parts (<Radar />, <PolarAngleAxis />, …) must be used within <EvilRadarChart />'
		);
	}

	return context;
}
