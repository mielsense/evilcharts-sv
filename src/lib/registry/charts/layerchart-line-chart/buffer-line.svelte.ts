import type { Attachment } from 'svelte/attachments';
import { BUFFER_DASH_SIZE, BUFFER_GAP_SIZE } from './types.js';

/**
 * Binary-search the path to find the length at which path.x ≈ targetX,
 * using the browser's native getPointAtLength for exact curve measurement.
 */
function findLengthAtX(path: SVGPathElement, totalLength: number, targetX: number): number {
	let lo = 0;
	let hi = totalLength;
	// ~0.5px precision is more than enough for a dasharray split
	while (hi - lo > 0.5) {
		const mid = (lo + hi) / 2;
		const pt = path.getPointAtLength(mid);
		if (pt.x < targetX) lo = mid;
		else hi = mid;
	}
	return (lo + hi) / 2;
}

/** Builds `<solidLength> 0 4 3 4 3 …` — a solid run, then repeating dash/gap for the buffer. */
function buildDashArray(path: SVGPathElement, splitX: number): string | null {
	const totalLength = path.getTotalLength();
	if (!totalLength) return null;

	const solidLength = findLengthAtX(path, totalLength, splitX);
	const lastSegmentLength = totalLength - solidLength;

	const reps = Math.ceil(lastSegmentLength / (BUFFER_DASH_SIZE + BUFFER_GAP_SIZE)) + 1;
	const dashedPart = Array.from(
		{ length: reps },
		() => `${BUFFER_DASH_SIZE} ${BUFFER_GAP_SIZE}`
	).join(' ');

	return `${solidLength} 0 ${dashedPart}`;
}

/**
 * Renders a line's last segment as dashed while the rest stays solid.
 *
 * Measures the real SVG path with `getTotalLength()` + `getPointAtLength()` and sets
 * `stroke-dasharray` imperatively, so it works with any curve type — a direct port of the
 * reference's `bufferLineShape`.
 *
 * Attaches to the wrapping `<g>` rather than the `<path>`: LayerChart's `<Spline>` cannot forward
 * an attachment (symbol-keyed props do not survive its rest-props plumbing), and an attachment on
 * the `<g>` runs before the child path is mounted. A `MutationObserver` on the subtree covers
 * both — it fires when the path appears and again whenever its `d` changes, which is exactly when
 * the dash must be recomputed (resize, curve change, brush filtering).
 *
 * @param splitX x coordinate of the second-to-last point — where solid meets dashed.
 */
export function bufferLine(splitX: () => number | undefined): Attachment<SVGGElement> {
	return (g) => {
		const x = splitX();
		if (x === undefined) return;

		let lastApplied: string | null = null;

		function apply() {
			const path = g.querySelector('path');
			if (!path) return;

			const dashArray = buildDashArray(path, x!);
			if (!dashArray || dashArray === lastApplied) return;

			lastApplied = dashArray;
			path.setAttribute('stroke-dasharray', dashArray);
		}

		apply();

		const observer = new MutationObserver(apply);
		observer.observe(g, { childList: true, subtree: true, attributeFilter: ['d'] });

		return () => observer.disconnect();
	};
}
