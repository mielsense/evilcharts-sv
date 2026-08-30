import { getLoadingData } from '../../../ui/layerchart-chart/loading.js';

export class LoadingDataState {
	#isLoading: () => boolean;
	#loadingPoints: () => number;
	#tick = $state(0);

	constructor(options: { isLoading: () => boolean; loadingPoints?: () => number }) {
		this.#isLoading = options.isLoading;
		this.#loadingPoints = options.loadingPoints ?? (() => 14);
	}

	get loadingData() {
		this.#tick;
		return getLoadingData(this.#loadingPoints());
	}

	onShimmerExit = () => {
		if (this.#isLoading()) this.#tick += 1;
	};
}
