import { getLoadingData } from '../../../ui/layerchart-chart/loading.js';

/**
 * Loading data with pixel-perfect shimmer synchronization.
 *
 * Uses motion.dev's onUpdate callback to ensure chart data is only regenerated
 * when the shimmer has completely exited the visible area. This eliminates
 * timing drift issues from setTimeout/setInterval.
 */
export class LoadingDataState {
	#isLoading: () => boolean;
	#loadingBars: () => number;
	/** Toggled by `onShimmerExit`; regenerates the skeleton data once per shimmer loop. */
	#tick = $state(0);

	constructor(options: { isLoading: () => boolean; loadingBars?: () => number }) {
		this.#isLoading = options.isLoading;
		this.#loadingBars = options.loadingBars ?? (() => 12);
	}

	get loadingData() {
		this.#tick;
		return getLoadingData(this.#loadingBars(), 20, 80);
	}

	/** Fired by motion.dev when the shimmer exits the visible area. */
	onShimmerExit = () => {
		if (this.#isLoading()) {
			this.#tick += 1;
		}
	};
}
