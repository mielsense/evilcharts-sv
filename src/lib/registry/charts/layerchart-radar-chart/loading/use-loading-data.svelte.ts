import { useReducedMotion } from '@humanspeak/svelte-motion';
import {
	LOADING_ANIMATION_DURATION,
	LOADING_CATEGORIES,
	LOADING_POINTS,
	LOADING_RADAR_DATA_KEY
} from '../types.js';

/** A fresh set of randomised loading points for the skeleton radar. */
function generateLoadingData(points: number) {
	return LOADING_CATEGORIES.slice(0, points).map((category) => ({
		skill: category,
		[LOADING_RADAR_DATA_KEY]: 30 + Math.random() * 70
	}));
}

/**
 * Regenerates the loading skeleton data on a fixed interval, so the skeleton radar keeps animating
 * between shapes while the chart is loading.
 */
export class LoadingDataState {
	#isLoading: () => boolean;
	#loadingPoints: () => number;
	/** Bumped by the interval; regenerates the skeleton shape each animation cycle. */
	#tick = $state(0);

	constructor(options: { isLoading: () => boolean; loadingPoints?: () => number }) {
		this.#isLoading = options.isLoading;
		this.#loadingPoints = options.loadingPoints ?? (() => LOADING_POINTS);
		const shouldReduceMotion = useReducedMotion();

		$effect(() => {
			if (!this.#isLoading() || shouldReduceMotion.current) return;

			const interval = setInterval(() => {
				this.#tick += 1;
			}, LOADING_ANIMATION_DURATION);

			return () => clearInterval(interval);
		});
	}

	get loadingData() {
		this.#tick;
		return generateLoadingData(this.#loadingPoints());
	}
}
