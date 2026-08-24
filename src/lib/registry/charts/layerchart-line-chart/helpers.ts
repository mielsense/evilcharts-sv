// Returns stroke/dot opacity — dims a series only when another is selected
export const getOpacity = (selectedDataKey: string | null, dataKey: string) => {
	if (selectedDataKey === null) {
		return { stroke: 1, dot: 1 };
	}

	return selectedDataKey === dataKey ? { stroke: 1, dot: 1 } : { stroke: 0.3, dot: 0.3 };
};

// Resolves a line's stroke-dasharray — the buffer line manages its own dashes
export const getStrokeDasharray = (enableBufferLine: boolean, isDashed: boolean) => {
	if (enableBufferLine) return undefined;

	return isDashed ? '5 5' : undefined;
};
