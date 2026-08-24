import type { AnyScale } from 'layerchart';

/**
 * Axis tick values with a leading tick dropped when its label cannot fit inside the plot.
 *
 * Recharts' `<XAxis>` runs `interval="preserveEnd"`: it keeps the last tick unconditionally and
 * discards any earlier one that will not fit. For a **point** scale with no outer padding that
 * always means the first tick — its label is centred on the plot's very left edge, so half of it
 * would spill outside. A **band** scale centres the label in the band instead, half a step in, so
 * nothing is dropped. LayerChart draws every tick it is given, so the same filter is applied here.
 *
 * Pass it straight to `<Axis ticks={dropOverflowingLeadTick}>`.
 */
export function dropOverflowingLeadTick(scale: AnyScale): unknown[] {
	const values = scale.domain() as unknown[];
	if (values.length < 2) return values;

	const range = scale.range() as number[];
	const start = Math.min(...range);

	// A band scale reports its band's leading edge, but the label sits at the band's centre.
	const bandOffset =
		typeof (scale as { bandwidth?: () => number }).bandwidth === 'function'
			? ((scale as { bandwidth: () => number }).bandwidth() ?? 0) / 2
			: 0;

	const first = (scale as (value: unknown) => number | undefined)(values[0]);
	if (typeof first !== 'number') return values;

	// Less than a pixel of room means the label is centred on the boundary itself.
	return first + bandOffset - start < 1 ? values.slice(1) : values;
}

/**
 * Axis tick values thinned so their labels do not collide, the way Recharts' `interval="preserveEnd"`
 * does: it keeps the last tick and walks backwards, dropping any tick whose label would come within
 * `minTickGap` of the one already kept. LayerChart's `tickSpacing` cannot do this — it only derives a
 * tick *count*, and it is disabled outright for band scales.
 *
 * Recharts measures real text; there is no rendered text to measure before the axis draws, so the
 * width is estimated from the label's length. `charWidth` defaults to a 12px monospace-ish advance,
 * which is what these axes use.
 *
 * Pass it to `<Axis ticks={…}>`; it also applies `dropOverflowingLeadTick`'s boundary rule.
 */
export function thinAxisTicks({
	format,
	minGap = 5,
	charWidth = 6.6
}: {
	/** Renders a domain value the way the axis will, so its width can be estimated. */
	format: (value: unknown, index: number) => string;
	/** Recharts' `minTickGap`, which defaults to 5. */
	minGap?: number;
	/** Estimated advance per character, in pixels. */
	charWidth?: number;
}) {
	return (scale: AnyScale): unknown[] => {
		const domain = scale.domain() as unknown[];
		const values = dropOverflowingLeadTick(scale);
		if (values.length < 2) return values;

		const bandOffset =
			typeof (scale as { bandwidth?: () => number }).bandwidth === 'function'
				? ((scale as { bandwidth: () => number }).bandwidth() ?? 0) / 2
				: 0;

		const centreOf = (value: unknown) =>
			Number((scale as (v: unknown) => number)(value)) + bandOffset;
		const halfWidthOf = (value: unknown) =>
			(format(
				value,
				domain.findIndex((candidate) => Object.is(candidate, value))
			).length *
				charWidth) /
			2;

		// Walk from the end, as `preserveEnd` does, keeping a tick only when it clears the last kept.
		const kept: unknown[] = [];
		let nextHeadEdge = Number.POSITIVE_INFINITY;

		for (let index = values.length - 1; index >= 0; index -= 1) {
			const value = values[index];
			const half = halfWidthOf(value);
			const tail = centreOf(value) + half;

			if (tail + minGap <= nextHeadEdge) {
				kept.push(value);
				nextHeadEdge = centreOf(value) - half;
			}
		}

		return kept.reverse();
	};
}

/**
 * Keeps the second argument that LayerChart supplies to format functions at runtime.
 *
 * Its public `FormatType` currently describes a single-argument callback even though Axis invokes
 * it as `format(tick, index)`. Recharts exposes that index, so this adapter keeps the runtime value
 * while remaining assignable to LayerChart's narrower callback type.
 */
export function layerChartFormatter(
	formatter: (value: unknown, index: number) => string
): (value: unknown, index?: number) => string {
	return (value, index = 0) => formatter(value, index);
}
