import type { DragType, EvilBrushRange } from './types.js';

/**
 * Keeps a range inside `[0, totalPoints - 1]` while preserving `minSpan`.
 *
 * Extracted from the reference's `clampRange` useCallback so the boundary rules are unit
 * testable; the logic is unchanged. `mode` matters because which edge gives way depends on
 * which handle the pointer is dragging.
 */
export function clampRange(
	range: EvilBrushRange,
	{ totalPoints, minSpan, mode }: { totalPoints: number; minSpan: number; mode?: DragType }
): EvilBrushRange {
	let { startIndex, endIndex } = range;
	const maxIndex = Math.max(0, totalPoints - 1);

	startIndex = Math.max(0, Math.min(startIndex, maxIndex));
	endIndex = Math.max(0, Math.min(endIndex, maxIndex));

	if (mode === 'left') {
		const maxStart = Math.max(0, endIndex - minSpan);
		startIndex = Math.min(startIndex, maxStart);
		return { startIndex, endIndex };
	}

	if (mode === 'right') {
		const minEnd = Math.min(maxIndex, startIndex + minSpan);
		endIndex = Math.max(endIndex, minEnd);
		return { startIndex, endIndex };
	}

	if (endIndex - startIndex < minSpan) {
		endIndex = Math.min(startIndex + minSpan, maxIndex);
		if (endIndex - startIndex < minSpan) {
			startIndex = Math.max(0, endIndex - minSpan);
		}
	}
	return { startIndex, endIndex };
}

/** Pans a range by `delta` indices, clamped to the dataset without changing its span. */
export function panRange(
	origin: EvilBrushRange,
	delta: number,
	totalPoints: number
): EvilBrushRange {
	const span = origin.endIndex - origin.startIndex;
	let s = origin.startIndex + delta;
	let e = s + span;
	if (s < 0) {
		s = 0;
		e = span;
	}
	if (e > totalPoints - 1) {
		e = totalPoints - 1;
		s = Math.max(0, e - span);
	}
	return { startIndex: s, endIndex: e };
}
