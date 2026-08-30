export function resolveEventSeriesKey(
	params: unknown,
	seriesKeyByIndex: readonly (string | undefined)[]
): string | null {
	if (!params || typeof params !== 'object') return null;
	const event = params as { seriesId?: unknown; seriesIndex?: unknown };
	const key =
		typeof event.seriesId === 'string'
			? event.seriesId
			: typeof event.seriesIndex === 'number'
				? seriesKeyByIndex[event.seriesIndex]
				: undefined;
	return typeof key === 'string' && !key.startsWith('__') ? key : null;
}

export function companionSeriesIds(
	line: { dataKey: string; glowing: boolean; enableBufferLine: boolean },
	enableHoverReveal: boolean,
	dataLength: number
): string[] {
	if (enableHoverReveal) return [`__reveal-base-${line.dataKey}`];
	const ids: string[] = [];
	if (line.glowing) {
		for (let index = 0; index < 4; index += 1) ids.push(`__glow-${index}-${line.dataKey}`);
	}
	if (line.enableBufferLine && dataLength >= 2) ids.push(`__buffer-${line.dataKey}`);
	return ids;
}

export function sliceToIndex<T>(values: readonly T[], index: number): (T | null)[] {
	return values.map((value, valueIndex) => (valueIndex > index ? null : value));
}

export function sliceFromIndex<T>(values: readonly T[], index: number): (T | null)[] {
	return values.map((value, valueIndex) => (valueIndex < index ? null : value));
}
