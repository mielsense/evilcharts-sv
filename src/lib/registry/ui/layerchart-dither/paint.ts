import { shouldPaintDitherCell } from './bayer.js';
import type { DitherVariant } from './types.js';

export type DitherBounds = {
	x: number;
	y: number;
	width: number;
	height: number;
};

export type DitherCell = {
	x: number;
	y: number;
	size: number;
};

export type DitherCoverageSample = {
	x: number;
	y: number;
	relativeX: number;
	relativeY: number;
	bounds: DitherBounds;
};

export type DitherCoverage = number | ((sample: DitherCoverageSample) => number);

export type DitherCellOptions = {
	coverage?: DitherCoverage;
	cellSize?: number;
	offsetX?: number;
	offsetY?: number;
};

export type DitherShapeOptions = DitherCellOptions & {
	color: string;
	opacity?: number;
};

export type DitherStrokeOptions = {
	color?: string;
	colors?: readonly string[];
	lineWidth?: number;
	cellSize?: number;
	opacity?: number;
	dash?: readonly number[];
	dashOffset?: number;
};

export type DitherVariantOptions = DitherCellOptions & {
	colors: readonly string[];
	variant: DitherVariant;
	opacity?: number;
	reverse?: boolean;
};

export type DitherArc = {
	centerX: number;
	centerY: number;
	innerRadius?: number;
	outerRadius: number;
	startAngle: number;
	endAngle: number;
};

function finite(value: number): number | null {
	return Number.isFinite(value) ? value : null;
}

function clampUnit(value: number): number {
	return Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));
}

export function ditherVariantCoverage(
	variant: DitherVariant,
	sample: Pick<DitherCoverageSample, 'x' | 'y' | 'relativeY'>,
	reverse = false
): number {
	const vertical = reverse ? sample.relativeY : 1 - sample.relativeY;
	if (variant === 'solid') return 0.875;
	if (variant === 'dotted') return 0.3125;
	if (variant === 'hatched') {
		return (Math.floor(sample.x / 2) + Math.floor(sample.y / 2)) % 4 < 2 ? 0.75 : 0.125;
	}
	return 0.18 + vertical * 0.72;
}

function colorAt(colors: readonly string[], position: number): string | null {
	if (colors.length === 0) return null;
	const index = Math.min(
		colors.length - 1,
		Math.max(0, Math.floor(clampUnit(position) * colors.length))
	);
	return colors[index];
}

export function normalizeDitherBounds(bounds: DitherBounds): DitherBounds {
	const x = finite(bounds.x);
	const y = finite(bounds.y);
	const width = finite(bounds.width);
	const height = finite(bounds.height);
	if (x === null || y === null || width === null || height === null) {
		return { x: x ?? 0, y: y ?? 0, width: 0, height: 0 };
	}

	return {
		x: width < 0 ? x + width : x,
		y: height < 0 ? y + height : y,
		width: Math.abs(width),
		height: Math.abs(height)
	};
}

export function* ditherCells(
	inputBounds: DitherBounds,
	options: DitherCellOptions = {}
): Generator<DitherCell> {
	const bounds = normalizeDitherBounds(inputBounds);
	if (bounds.width === 0 || bounds.height === 0) return;

	const cellSize = Math.max(1, Math.floor(options.cellSize ?? 2));
	const coverage = options.coverage ?? 0.5;
	const endX = bounds.x + bounds.width;
	const endY = bounds.y + bounds.height;
	const startX = Math.floor(bounds.x / cellSize) * cellSize;
	const startY = Math.floor(bounds.y / cellSize) * cellSize;

	for (let y = startY; y < endY; y += cellSize) {
		for (let x = startX; x < endX; x += cellSize) {
			const centerX = x + cellSize / 2;
			const centerY = y + cellSize / 2;
			const sample: DitherCoverageSample = {
				x: centerX,
				y: centerY,
				relativeX: clampUnit((centerX - bounds.x) / bounds.width),
				relativeY: clampUnit((centerY - bounds.y) / bounds.height),
				bounds
			};
			const amount = clampUnit(typeof coverage === 'function' ? coverage(sample) : coverage);
			if (
				shouldPaintDitherCell(x, y, amount, {
					cellSize,
					offsetX: options.offsetX,
					offsetY: options.offsetY
				})
			) {
				yield { x, y, size: cellSize };
			}
		}
	}
}

export function paintDitherPath(
	context: CanvasRenderingContext2D,
	path: Path2D,
	bounds: DitherBounds,
	options: DitherShapeOptions
): void {
	context.save();
	context.clip(path);
	context.fillStyle = options.color;
	context.globalAlpha *= clampUnit(options.opacity ?? 1);
	for (const cell of ditherCells(bounds, options)) {
		context.fillRect(cell.x, cell.y, cell.size, cell.size);
	}
	context.restore();
}

export function paintDitherVariantPath(
	context: CanvasRenderingContext2D,
	path: Path2D,
	bounds: DitherBounds,
	options: DitherVariantOptions
): void {
	const normalized = normalizeDitherBounds(bounds);
	if (normalized.width === 0 || normalized.height === 0 || options.colors.length === 0) return;

	context.save();
	context.clip(path);
	context.globalAlpha *= clampUnit(options.opacity ?? 1);
	for (const cell of ditherCells(normalized, {
		...options,
		coverage: (sample) => ditherVariantCoverage(options.variant, sample, options.reverse)
	})) {
		const relativeY = (cell.y + cell.size / 2 - normalized.y) / normalized.height;
		const color = colorAt(options.colors, options.reverse ? 1 - relativeY : relativeY);
		if (!color) continue;
		context.fillStyle = color;
		context.fillRect(cell.x, cell.y, cell.size, cell.size);
	}
	context.restore();
}

export function paintDitherRect(
	context: CanvasRenderingContext2D,
	bounds: DitherBounds,
	options: DitherShapeOptions
): void {
	const normalized = normalizeDitherBounds(bounds);
	const path = new Path2D();
	path.rect(normalized.x, normalized.y, normalized.width, normalized.height);
	paintDitherPath(context, path, normalized, options);
}

export function paintDitherPolygon(
	context: CanvasRenderingContext2D,
	points: ReadonlyArray<readonly [number, number]>,
	options: DitherShapeOptions
): void {
	if (points.length < 3) return;
	const path = new Path2D();
	path.moveTo(points[0][0], points[0][1]);
	for (const [x, y] of points.slice(1)) path.lineTo(x, y);
	path.closePath();
	const xs = points.map(([x]) => x);
	const ys = points.map(([, y]) => y);
	const minX = Math.min(...xs);
	const maxX = Math.max(...xs);
	const minY = Math.min(...ys);
	const maxY = Math.max(...ys);
	paintDitherPath(
		context,
		path,
		{ x: minX, y: minY, width: maxX - minX, height: maxY - minY },
		options
	);
}

export function paintDitherArc(
	context: CanvasRenderingContext2D,
	arc: DitherArc,
	options: DitherShapeOptions
): void {
	const outerRadius = Math.max(0, arc.outerRadius);
	const innerRadius = Math.min(outerRadius, Math.max(0, arc.innerRadius ?? 0));
	if (outerRadius === 0 || arc.startAngle === arc.endAngle) return;

	const path = new Path2D();
	path.arc(arc.centerX, arc.centerY, outerRadius, arc.startAngle, arc.endAngle);
	if (innerRadius > 0) {
		path.arc(arc.centerX, arc.centerY, innerRadius, arc.endAngle, arc.startAngle, true);
	} else {
		path.lineTo(arc.centerX, arc.centerY);
	}
	path.closePath();
	paintDitherPath(
		context,
		path,
		{
			x: arc.centerX - outerRadius,
			y: arc.centerY - outerRadius,
			width: outerRadius * 2,
			height: outerRadius * 2
		},
		options
	);
}

export function paintDitherStroke(
	context: CanvasRenderingContext2D,
	path: Path2D,
	options: DitherStrokeOptions
): void {
	const cellSize = Math.max(1, Math.floor(options.cellSize ?? 2));
	const colors = options.colors?.length ? options.colors : options.color ? [options.color] : [];
	if (colors.length === 0) return;
	context.save();
	if (colors.length === 1) {
		context.strokeStyle = colors[0];
	} else {
		const gradient = context.createLinearGradient(0, 0, context.canvas.width, 0);
		colors.forEach((color, index) =>
			gradient.addColorStop(colors.length === 1 ? 0 : index / (colors.length - 1), color)
		);
		context.strokeStyle = gradient;
	}
	context.globalAlpha *= clampUnit(options.opacity ?? 1);
	context.lineWidth = Math.max(1, options.lineWidth ?? cellSize);
	context.lineCap = 'butt';
	context.setLineDash(options.dash?.length ? [...options.dash] : [cellSize, cellSize]);
	context.lineDashOffset = options.dashOffset ?? 0;
	context.stroke(path);
	context.restore();
}
