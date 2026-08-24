/**
 * Geometry for the table-of-contents indicator.
 *
 * Ported from `evilcharts/src/components/docs/mdx/components/toc-indicator.tsx`. Every constant
 * and every arithmetic step is the reference's; only React's hooks become runes.
 */
import type { TocEntry } from '$site/lib/source.js';

const STARTING_MARGIN = 8;
const DEPTH_INDENT = 10;
const DEPTH_BEND_LENGTH = 8;

export const SPRING_CONFIG = { stiffness: 180, damping: 20 };
export const GRADIENT_HEIGHT = 66;
export { STARTING_MARGIN };

/**
 * Every row's real geometry, relative to the indicator's own box. Measured rather than derived
 * from a constant row height: a heading long enough to wrap makes the list taller than any fixed
 * step, and the path — and with it the active marker — would drift a full line further out of
 * place with each wrapped entry above it.
 */
export type RowMetrics = {
	top: number;
	height: number;
};

export type PathData = {
	path: string;
	totalLength: number;
	itemCenterDistances: number[];
};

export type HeadingPosition = {
	id: string;
	top: number;
};

function getXForDepth(depth: number, minDepth: number): number {
	return STARTING_MARGIN + (depth - minDepth) * DEPTH_INDENT;
}

function getDiagonalDistance(deltaX: number): number {
	return Math.sqrt(deltaX ** 2 + DEPTH_BEND_LENGTH ** 2);
}

export function generatePathData(toc: TocEntry[], rows: RowMetrics[]): PathData {
	// Before the first measurement there is nothing to draw against; the measuring effect fills
	// rows in before paint, so this never shows as a flash.
	if (toc.length === 0 || rows.length !== toc.length) {
		return { path: '', totalLength: 0, itemCenterDistances: [] };
	}

	const minDepth = Math.min(...toc.map((item) => item.depth));
	const pathParts: string[] = [];
	const itemCenterDistances: number[] = [];

	let currentX = getXForDepth(toc[0].depth, minDepth);
	let currentY = rows[0].top - STARTING_MARGIN;
	let accumulatedLength = 0;

	pathParts.push(`M ${currentX} ${currentY}`);

	for (let i = 0; i < toc.length; i++) {
		const isLastItem = i === toc.length - 1;
		const row = rows[i];
		const itemCenterY = row.top + row.height / 2;
		// The line runs to the bottom of each row so the bend into the next depth happens in the
		// gap, but stops at the centre of the last one — that is where the end marker belongs,
		// whether that row is one line or three.
		const rowBottomY = isLastItem ? itemCenterY : row.top + row.height;
		const nextItem = toc[i + 1];

		const distanceToCenter = itemCenterY - currentY;
		itemCenterDistances.push(accumulatedLength + distanceToCenter);

		const verticalLength = rowBottomY - currentY;
		accumulatedLength += verticalLength;
		pathParts.push(`L ${currentX} ${rowBottomY}`);
		currentY = rowBottomY;

		if (nextItem) {
			const nextX = getXForDepth(nextItem.depth, minDepth);

			if (nextX !== currentX) {
				const deltaX = nextX - currentX;
				accumulatedLength += getDiagonalDistance(deltaX);
				pathParts.push(`L ${nextX} ${currentY + DEPTH_BEND_LENGTH}`);
				currentX = nextX;
				currentY += DEPTH_BEND_LENGTH;
			}
		}
	}

	return { path: pathParts.join(' '), totalLength: accumulatedLength, itemCenterDistances };
}

export function sameRows(a: RowMetrics[], b: RowMetrics[]): boolean {
	return (
		a.length === b.length &&
		a.every(
			(row, i) => Math.abs(row.top - b[i].top) < 0.5 && Math.abs(row.height - b[i].height) < 0.5
		)
	);
}

export function getActiveDistance(activeIndex: number, itemCenterDistances: number[]): number {
	const isValidIndex = activeIndex >= 0 && activeIndex < itemCenterDistances.length;
	return isValidIndex ? itemCenterDistances[activeIndex] : 0;
}

export function selectActiveHeading(
	itemIds: string[],
	positions: HeadingPosition[],
	offset: number
): string | null {
	const topById = Object.fromEntries(positions.map((position) => [position.id, position.top]));
	let active: string | null = null;

	for (const id of itemIds) {
		const top = topById[id];
		if (top === undefined || top > offset) break;
		active = id;
	}

	return active;
}
