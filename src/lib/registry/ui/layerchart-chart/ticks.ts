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
	charWidth = 6.6,
	leadingInset = 0
}: {
	/** Renders a domain value the way the axis will, so its width can be estimated. */
	format: (value: unknown, index: number) => string;
	/** Recharts' `minTickGap`, which defaults to 5. */
	minGap?: number;
	/** Estimated advance per character, in pixels. */
	charWidth?: number;
	/** Space between the SVG edge and the scale range (for example a rendered Y axis). */
	leadingInset?: number;
}) {
	return (scale: AnyScale): unknown[] => {
		const domain = scale.domain() as unknown[];
		if (domain.length < 2) return domain;

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
		const range = scale.range() as number[];
		const endBoundary = Math.max(...range);

		// Recharts moves the final label just far enough inward for its trailing edge to stay inside
		// the axis view box. That shifted label then owns the collision boundary, which is why a
		// narrow Jan–Dec axis keeps Dec but drops Nov even though the unshifted labels would fit.
		const kept: unknown[] = [];
		let nextHeadEdge = Number.POSITIVE_INFINITY;

		for (let index = domain.length - 1; index >= 0; index -= 1) {
			const value = domain[index];
			const half = halfWidthOf(value);
			const centre = centreOf(value);

			// The first point-scale label may use space before the plot when a Y axis has reserved it.
			// Clip against the SVG's physical leading edge (0), not the scale range's first position.
			if (index === 0 && leadingInset + centre - half < 0) continue;

			const adjustedCentre =
				index === domain.length - 1 ? Math.min(centre, endBoundary - half) : centre;
			const tail = adjustedCentre + half;

			if (tail + minGap <= nextHeadEdge) {
				kept.push(value);
				nextHeadEdge = adjustedCentre - half;
			}
		}

		return kept.reverse();
	};
}

/**
 * Recharts' numeric axes default to five ticks and include both ends of the resolved domain.
 * D3's `scale.ticks(5)` instead chooses a rounded step and can omit the upper endpoint (for
 * example `[0, 500, 1000, 1500]` for a `[0, 1800]` domain), so LayerChart needs explicit values.
 */
export function rechartsValueAxisTicks(scale: AnyScale, count = 5): unknown[] {
	const domain = scale.domain() as unknown[];
	const start = Number(domain[0]);
	const end = Number(domain.at(-1));
	if (!Number.isFinite(start) || !Number.isFinite(end) || count < 2) return domain;

	const step = (end - start) / (count - 1);
	return Array.from({ length: count }, (_, index) =>
		Number((start + step * index).toPrecision(12))
	);
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
