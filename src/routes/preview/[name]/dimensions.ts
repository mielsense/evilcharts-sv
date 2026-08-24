export const PREVIEW_WIDTH = { fallback: 630, min: 240, max: 1600 } as const;
export const PREVIEW_HEIGHT = { fallback: 360, min: 180, max: 1200 } as const;

type DimensionBounds = {
	fallback: number;
	min: number;
	max: number;
};

export function parsePreviewDimension(value: string | null, bounds: DimensionBounds): number {
	if (value === null || !/^\d+(?:\.\d+)?$/.test(value.trim())) return bounds.fallback;

	const number = Number(value);
	if (!Number.isFinite(number)) return bounds.fallback;
	return Math.min(bounds.max, Math.max(bounds.min, number));
}
