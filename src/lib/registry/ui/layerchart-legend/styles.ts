/** Solid fill / gradient background for filled variants. */
export function getLegendFillStyle(dataKey: string, colorsCount: number): string {
	if (colorsCount <= 1) {
		return `background-color: var(--color-${dataKey}-0)`;
	}

	const stops = Array.from({ length: colorsCount }, (_, i) => {
		const offset = (i / (colorsCount - 1)) * 100;
		return `var(--color-${dataKey}-${i}) ${offset}%`;
	}).join(', ');

	return `background: linear-gradient(to right, ${stops})`;
}

/**
 * Outline style for stroke variants.
 * Uses background + mask-composite to punch out the center, leaving only the
 * "border" visible. Works with both solid colors and gradients, and respects
 * border-radius — unlike plain `border-color`.
 */
export function getLegendOutlineStyle(dataKey: string, colorsCount: number): string {
	const maskStyle = [
		'-webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
		'-webkit-mask-composite: xor',
		'mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
		'mask-composite: exclude'
	].join('; ');

	if (colorsCount <= 1) {
		return `background-color: var(--color-${dataKey}-0); ${maskStyle}`;
	}

	const stops = Array.from({ length: colorsCount }, (_, i) => {
		const offset = (i / (colorsCount - 1)) * 100;
		return `var(--color-${dataKey}-${i}) ${offset}%`;
	}).join(', ');

	return `background: linear-gradient(to right, ${stops}); ${maskStyle}`;
}
