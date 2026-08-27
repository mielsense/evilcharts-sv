// Generate random loading data for skeleton/loading state
// min/max represent percentage of the range (0-100), defaults to 20-80 for realistic look
/** Internal ordinal key that lets LayerChart spread generated loading rows across a category scale. */
export const LOADING_CATEGORY_DATA_KEY = '__loadingCategory';

export const getLoadingData = (points: number = 10, min: number = 0, max: number = 70) => {
	const range = max - min;
	return Array.from({ length: points }, (_, index) => ({
		[LOADING_CATEGORY_DATA_KEY]: index,
		loading: Math.floor(Math.random() * range) + min
	}));
};
