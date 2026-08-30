import { chartColorVariable } from '../layerchart-chart/colors.js';
import type { DitherCanvasFrame, DitherVariant } from './types.js';

export type DitherMarkKind = 'fill' | 'stroke';

export type DitherDomMark = {
	element: SVGGraphicsElement;
	path: Path2D;
	bounds: { x: number; y: number; width: number; height: number };
	kind: DitherMarkKind;
	key: string;
	variant: DitherVariant;
	reverse: boolean;
	opacity: number;
	lineWidth: number;
	dash: number[];
	dashOffset: number;
	reveal: string | null;
	glow: boolean;
};

const VARIANTS = new Set<DitherVariant>(['gradient', 'dotted', 'hatched', 'solid']);

function numberAttribute(element: Element, name: string, fallback = 0): number {
	const value = Number(element.getAttribute(name));
	return Number.isFinite(value) ? value : fallback;
}

function sourcePath(element: SVGGraphicsElement): Path2D | null {
	if (element instanceof SVGPathElement) {
		const d = element.getAttribute('d');
		return d ? new Path2D(d) : null;
	}
	if (element instanceof SVGRectElement) {
		const path = new Path2D();
		const x = numberAttribute(element, 'x');
		const y = numberAttribute(element, 'y');
		const width = numberAttribute(element, 'width');
		const height = numberAttribute(element, 'height');
		const rx = Math.max(0, numberAttribute(element, 'rx'));
		if (rx > 0 && 'roundRect' in path) path.roundRect(x, y, width, height, rx);
		else path.rect(x, y, width, height);
		return path;
	}
	return null;
}

function transformedPath(element: SVGGraphicsElement, canvas: HTMLCanvasElement): Path2D | null {
	const source = sourcePath(element);
	const matrix = element.getScreenCTM();
	if (!source || !matrix) return null;
	const canvasBox = canvas.getBoundingClientRect();
	const toCanvas = new DOMMatrix().translate(-canvasBox.left, -canvasBox.top).multiply(matrix);
	const path = new Path2D();
	path.addPath(source, toCanvas);
	return path;
}

function parseOpacity(value: string): number {
	const parsed = Number.parseFloat(value);
	return Number.isFinite(parsed) ? Math.min(1, Math.max(0, parsed)) : 1;
}

function parseDash(value: string): number[] {
	if (!value || value === 'none') return [];
	return value
		.split(/[ ,]+/)
		.map(Number)
		.filter((part) => Number.isFinite(part) && part >= 0);
}

export function collectDitherDomMarks(
	root: Element,
	canvas: HTMLCanvasElement,
	fallbackVariant: DitherVariant
): DitherDomMark[] {
	const canvasBox = canvas.getBoundingClientRect();
	const marks: DitherDomMark[] = [];
	for (const candidate of root.querySelectorAll<SVGGraphicsElement>('[data-evil-dither-mark]')) {
		const kind = candidate.dataset.evilDitherMark;
		const key = candidate.dataset.evilDitherKey;
		if ((kind !== 'fill' && kind !== 'stroke') || !key) continue;
		const path = transformedPath(candidate, canvas);
		if (!path) continue;

		const box = candidate.getBoundingClientRect();
		const style = getComputedStyle(candidate);
		const variantValue = candidate.dataset.evilDitherVariant;
		const variant = VARIANTS.has(variantValue as DitherVariant)
			? (variantValue as DitherVariant)
			: fallbackVariant;
		const paintOpacity = kind === 'fill' ? style.fillOpacity : style.strokeOpacity;

		marks.push({
			element: candidate,
			path,
			bounds: {
				x: box.left - canvasBox.left,
				y: box.top - canvasBox.top,
				width: box.width,
				height: box.height
			},
			kind,
			key,
			variant,
			reverse: candidate.dataset.evilDitherReverse === 'true',
			opacity: parseOpacity(style.opacity) * parseOpacity(paintOpacity),
			lineWidth: Math.max(1, Number.parseFloat(style.strokeWidth) || 1),
			dash: parseDash(style.strokeDasharray),
			dashOffset: Number.parseFloat(style.strokeDashoffset) || 0,
			reveal: candidate.dataset.evilDitherReveal ?? null,
			glow: candidate.dataset.evilDitherGlow === 'true'
		});
	}
	return marks;
}

export function resolveDitherSeriesColors(frame: DitherCanvasFrame, key: string): string[] {
	const colors: string[] = [];
	for (let index = 0; index < 32; index += 1) {
		const color = frame.resolveColor(chartColorVariable(key, index));
		if (!color) break;
		colors.push(color);
	}
	return colors;
}

/** Evaluates a CSS cubic-bezier curve at an input time. */
export function cubicBezierProgress(
	progress: number,
	x1: number,
	y1: number,
	x2: number,
	y2: number
): number {
	const target = Math.min(1, Math.max(0, progress));
	const sample = (t: number, a: number, b: number) => {
		const inverse = 1 - t;
		return 3 * inverse * inverse * t * a + 3 * inverse * t * t * b + t * t * t;
	};
	let low = 0;
	let high = 1;
	for (let index = 0; index < 14; index += 1) {
		const middle = (low + high) / 2;
		if (sample(middle, x1, x2) < target) low = middle;
		else high = middle;
	}
	return sample((low + high) / 2, y1, y2);
}

export function clipDitherReveal(
	context: CanvasRenderingContext2D,
	bounds: DitherDomMark['bounds'],
	type: string | null,
	progress: number
): void {
	if (!type || type === 'none' || progress >= 1) return;
	const eased = cubicBezierProgress(progress, 0, 0.7, 0.5, 1);
	const { x, y, width, height } = bounds;
	context.beginPath();
	if (type === 'right-to-left') {
		context.rect(x + width * (1 - eased), y, width * eased, height);
	} else if (type === 'center-out') {
		context.rect(x + (width * (1 - eased)) / 2, y, width * eased, height);
	} else if (type === 'edges-in') {
		context.rect(x, y, (width * eased) / 2, height);
		context.rect(x + width * (1 - eased / 2), y, (width * eased) / 2, height);
	} else {
		context.rect(x, y, width * eased, height);
	}
	context.clip();
}
