import { getLoadingData } from '../../../ui/layerchart-chart/loading.js';

/** Stable random data for the area skeleton. Only the shimmer moves while loading. */
export class LoadingDataState {
	#loadingPoints: () => number;

	constructor(options: { loadingPoints?: () => number }) {
		this.#loadingPoints = options.loadingPoints ?? (() => 14);
	}

	get loadingData() {
		return getLoadingData(this.#loadingPoints());
	}
}
