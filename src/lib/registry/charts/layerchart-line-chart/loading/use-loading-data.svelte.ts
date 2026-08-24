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
	#loadingPoints: () => number;
	/** Toggled by `onShimmerExit`; regenerates the skeleton data once per shimmer loop. */
	#tick = $state(0);

	constructor(options: { isLoading: () => boolean; loadingPoints?: () => number }) {
		this.#isLoading = options.isLoading;
		this.#loadingPoints = options.loadingPoints ?? (() => 14);
	}

	get loadingData() {
		this.#tick;
		return getLoadingData(this.#loadingPoints());
	}

	/** Fired by motion.dev when the shimmer exits the visible area. */
	onShimmerExit = () => {
		if (this.#isLoading()) {
			this.#tick += 1;
		}
	};
}
