<script lang="ts">
	/**
	 * The polar grid lines. Defaults to a dashed polygon grid, matching Recharts'
	 * `<PolarGrid gridType="polygon">`; `gridType="circle"` draws concentric circles instead.
	 */
	import { Grid, type AnyScale } from 'layerchart';

	let {
		gridType = 'polygon',
		stroke = 'currentColor',
		strokeOpacity = 0.2,
		strokeDasharray = '3 4',
		...restProps
	}: {
		gridType?: 'polygon' | 'circle';
		stroke?: string;
		strokeOpacity?: number;
		strokeDasharray?: string;
		[key: string]: unknown;
	} = $props();

	/**
	 * Both spellings of each stroke prop.
	 *
	 * LayerChart renders the radial spokes as `<Line>` and the rings as `<Spline>`, and the two
	 * declare different subsets: `<Line>` accepts `dashArray` but drops a camelCase
	 * `strokeOpacity`, while `<Spline>` accepts `strokeOpacity` but has no `dashArray`. Passing the
	 * declared name *and* the raw SVG attribute means whichever one a component does not declare
	 * still reaches the element through its rest props, so the spokes and the rings end up styled
	 * identically. See plans/DEVIATIONS.md U-4.
	 */
	const lineProps = $derived({
		stroke,
		strokeOpacity,
		'stroke-opacity': strokeOpacity,
		dashArray: strokeDasharray,
		'stroke-dasharray': strokeDasharray
	});

	/**
	 * Ring radii, evenly divided from the centre to the data maximum.
	 *
	 * Recharts' `<PolarGrid>` draws one ring per radius-axis tick, and its radius axis divides the
	 * exact `[0, dataMax]` domain into `tickCount` (5) steps — so the outermost ring lands *on* the
	 * largest value. d3's `ticks()` instead picks round numbers (0, 100, 200, 300 for a max of 305),
	 * which leaves the outer ring inside the widest polygon.
	 */
	const RING_COUNT = 5;

	function evenRings(scale: AnyScale) {
		const domain = scale.domain() as number[];
		const min = Number(domain[0]);
		const max = Number(domain[domain.length - 1]);
		if (!Number.isFinite(min) || !Number.isFinite(max)) return undefined;

		const step = (max - min) / (RING_COUNT - 1);
		return Array.from({ length: RING_COUNT }, (_, index) => min + step * index);
	}
</script>

<!--
	Recharts draws both the radial spokes and the rings; LayerChart splits them into the `x` and `y`
	line sets. `radialY` picks the ring shape — a linear spline is the polygon web, matching
	Recharts' `gridType`.
-->
<Grid
	x={lineProps}
	y={lineProps}
	yTicks={evenRings}
	radialY={gridType === 'circle' ? 'circle' : 'linear'}
	{...restProps}
/>
