type LifecycleOptions = {
	animation?: unknown;
	animationDuration?: unknown;
	animationDurationUpdate?: unknown;
};

/** Merge consumer options without letting them break chart-owned animation lifecycles. */
export function mergeLifecycleOptions<T extends object>(built: T, overrides?: object): T {
	const lifecycle = built as T & LifecycleOptions;
	return {
		...built,
		...overrides,
		animation: lifecycle.animation,
		animationDuration: lifecycle.animationDuration,
		animationDurationUpdate: lifecycle.animationDurationUpdate
	} as T;
}
