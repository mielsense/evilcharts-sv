const BAYER_4 = [
	[0, 8, 2, 10],
	[12, 4, 14, 6],
	[3, 11, 1, 9],
	[15, 7, 13, 5]
] as const;

export type BayerOptions = {
	cellSize?: number;
	offsetX?: number;
	offsetY?: number;
};

function positiveModulo(value: number, divisor: number): number {
	return ((value % divisor) + divisor) % divisor;
}

function cellAt(coordinate: number, cellSize: number, offset: number): number {
	return positiveModulo(Math.floor((coordinate + offset) / cellSize), BAYER_4.length);
}

export function bayerThreshold(x: number, y: number, options: BayerOptions = {}): number {
	const cellSize = Math.max(1, Math.floor(options.cellSize ?? 1));
	const column = cellAt(x, cellSize, options.offsetX ?? 0);
	const row = cellAt(y, cellSize, options.offsetY ?? 0);

	return (BAYER_4[row][column] + 0.5) / 16;
}

export function shouldPaintDitherCell(
	x: number,
	y: number,
	coverage: number,
	options?: BayerOptions
): boolean {
	if (coverage <= 0) return false;
	if (coverage >= 1) return true;

	return coverage > bayerThreshold(x, y, options);
}
