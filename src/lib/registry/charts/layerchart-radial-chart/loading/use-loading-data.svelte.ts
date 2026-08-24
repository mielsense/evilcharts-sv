import { useReducedMotion } from '@humanspeak/svelte-motion';
import { LOADING_ANIMATION_DURATION, LOADING_BARS } from '../types.js';

/** Random skeleton rows with values between 40 and 100. */
function generateLoadingData() {
	return Array.from({ length: LOADING_BARS }, (_, index) => ({
		name: `loading${index}`,
		value: 40 + Math.random() * 60
	}));
}

/** Regenerates the skeleton rows on a fixed interval, so the bars keep animating while loading. */
export class LoadingDataState {
	#isLoading: () => boolean;
	/** Bumped by the interval; regenerates the skeleton values each cycle. */
	#tick = $state(0);

	constructor(options: { isLoading: () => boolean }) {
		this.#isLoading = options.isLoading;
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
		return generateLoadingData();
	}
}
