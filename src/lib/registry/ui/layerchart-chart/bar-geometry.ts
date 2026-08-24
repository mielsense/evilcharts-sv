/**
 * Bar sizing and placement within a category, ported from Recharts' `getBarPositions`.
 *
 * LayerChart divides a band with a nested `scaleBand`, which cannot reproduce Recharts' numbers:
 * Recharts subtracts the category gap and the inter-bar gaps from the band, divides what is left
 * between the bars, and **floors the result to a whole pixel** — so a 49px band holding two bars
 * with `barCategoryGap="10%"` and `barGap={4}` yields bars of exactly 17px, not 17.6px. It also
 * supports a fixed `barSize`, which centres a group of that width in the band.
 *
 * The port therefore computes each bar's offset and width here and applies them as `insets` on
 * LayerChart's `<Bar>`, leaving the band itself undivided.
 */

/** Leading/trailing insets along one axis, as LayerChart's `<Bar insets>` takes them. */
export type BarInsets = { left?: number; right?: number; top?: number; bottom?: number };

export type BarSlot = {
	/** Distance from the band's leading edge to this bar's leading edge, in pixels. */
	offset: number;
	/** Width of this bar along the category axis, in pixels. */
	size: number;
};

/**
 * Recharts' `getPercentValue` for a gap: a `"10%"` string resolves against the band, a number is
 * taken as pixels, and the result is clamped into `[0, bandSize]`.
 */
function resolveGap(
	value: number | string | undefined,
	bandSize: number,
	fallback: number | string
) {
	const raw = value ?? fallback;
	const resolved =
		typeof raw === 'string' && raw.trim().endsWith('%')
			? (Number.parseFloat(raw) / 100) * bandSize
			: Number(raw);

	if (!Number.isFinite(resolved)) return 0;
	return Math.max(0, Math.min(resolved, bandSize));
}

export function getBarPositions({
	bandSize,
	count,
	barGap,
	barCategoryGap,
	barSize,
	maxBarSize
}: {
	/** The category band's full size along the category axis. */
	bandSize: number;
	/** How many bars share the category. Stacked series count as one. */
	count: number;
	/** Gap between bars sharing a category. Recharts' default is `4`. */
	barGap?: number | string;
	/** Gap on each side of the category. Recharts' default is `"10%"`. */
	barCategoryGap?: number | string;
	/** Fixed bar width. When set, the group is centred in the band at that width. */
	barSize?: number;
	/** Upper bound on the derived width. */
	maxBarSize?: number;
}): BarSlot[] {
	if (count < 1 || !(bandSize > 0)) return [];

	let realBarGap = resolveGap(barGap, bandSize, 4);

	if (barSize != null && Number.isFinite(barSize)) {
		let useFull = false;
		let fullBarSize = bandSize / count;
		let sum = count * barSize + (count - 1) * realBarGap;

		// Too wide to fit: first drop the gaps, then fall back to 90% of an even share.
		if (sum >= bandSize) {
			sum -= (count - 1) * realBarGap;
			realBarGap = 0;
		}
		if (sum >= bandSize && fullBarSize > 0) {
			useFull = true;
			fullBarSize *= 0.9;
			sum = count * fullBarSize;
		}

		// Recharts truncates the centring offset to a whole pixel (`>> 0`).
		const offset = Math.trunc((bandSize - sum) / 2);
		const size = useFull ? fullBarSize : barSize;

		return Array.from({ length: count }, (_, index) => ({
			offset: offset + (size + realBarGap) * index,
			size
		}));
	}

	const categoryOffset = resolveGap(barCategoryGap, bandSize, '10%');
	// No room left for gaps once the category inset is taken out.
	if (bandSize - 2 * categoryOffset - (count - 1) * realBarGap <= 0) realBarGap = 0;

	let originalSize = (bandSize - 2 * categoryOffset - (count - 1) * realBarGap) / count;
	// Recharts floors anything above a pixel (`>>= 0`), which is why bars land on whole pixels.
	if (originalSize > 1) originalSize = Math.trunc(originalSize);

	const size =
		maxBarSize != null && Number.isFinite(maxBarSize)
			? Math.min(originalSize, maxBarSize)
			: originalSize;

	// The stride uses the unclamped size, so `maxBarSize` narrows a bar in place rather than
	// re-packing the group — again matching Recharts.
	return Array.from({ length: count }, (_, index) => ({
		offset: categoryOffset + (originalSize + realBarGap) * index + (originalSize - size) / 2,
		size
	}));
}
