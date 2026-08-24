<script lang="ts">
	/**
	 * One grid column: ghost squares filling the plot height, and solid squares stacked up to the
	 * value.
	 *
	 * The reference draws both from Recharts' shape props — the background gets `y` = the plot top
	 * and `height` = the full plot, so `y + height` is the shared baseline the data squares also
	 * stack from. Here both come off the chart scales instead, with the same arithmetic.
	 */
	import { Bar as LayerBar, getChartContext } from 'layerchart';
	import { getBarPositions } from '$lib/registry/ui/layerchart-chart/index.js';

	let { dataKey, rows, fill }: { dataKey: string; rows: Record<string, unknown>[]; fill: string } =
		$props();

	const layer = getChartContext();

	/**
	 * Recharts hands a `background` shape its *own* default fill rather than the bar's, which is why
	 * the reference's ghost squares are grey and not the series colour — measured as `#eee` on the
	 * running reference. The `dark:opacity-[0.1]` class then knocks them back on a dark surface.
	 */
	const GHOST_FILL = '#eee';

	const SQUARE_SIZE = 10;
	const GAP = 2;
	const CELL_SIZE = SQUARE_SIZE + GAP;

	/** Squares for one column, stacked upward from `bottomY`. */
	function squaresOf(squareX: number, squareSize: number, bottomY: number, count: number) {
		return Array.from({ length: count }, (_, index) => ({
			index,
			x: squareX,
			y: bottomY - (index + 1) * CELL_SIZE + GAP,
			size: squareSize
		}));
	}

	const columns = $derived.by(() => {
		const band = layer.xScale.bandwidth?.() ?? 0;
		const slot = getBarPositions({ bandSize: band, count: 1 })[0];
		const width = slot?.size ?? band;
		const baseline = Number(layer.yScale(0));
		const plotTop = Math.min(...layer.yRange);
		const plotHeight = Math.abs(baseline - plotTop);

		return rows.map((row, index) => {
			const value = Number(row[dataKey] ?? 0);
			const barTop = Number(layer.yScale(value));
			const barHeight = Math.abs(baseline - barTop);

			const squareSize = Math.min(SQUARE_SIZE, Math.max(2, width - 2));
			const squareX =
				(Number(layer.xScale(index as never)) || 0) +
				(slot?.offset ?? 0) +
				Math.floor((width - squareSize) / 2);

			return {
				row,
				index,
				// The ghost column always fills the plot; the data column stops at the value.
				ghost:
					plotHeight > 0
						? squaresOf(squareX, squareSize, baseline, Math.floor(plotHeight / CELL_SIZE))
						: [],
				solid:
					barHeight > 0
						? squaresOf(
								squareX,
								squareSize,
								baseline,
								Math.max(1, Math.floor(barHeight / CELL_SIZE))
							)
						: []
			};
		});
	});
</script>

{#each columns as column (column.index)}
	<!-- Transparent twin keeps the column hoverable, as Recharts' own bar rect does. -->
	<LayerBar data={column.row} seriesKey={dataKey} fill="transparent" motion="none" tooltip />

	{#each column.ghost as square (square.index)}
		<rect
			class="dark:opacity-[0.1]"
			x={square.x}
			y={square.y}
			width={square.size}
			height={square.size}
			fill={GHOST_FILL}
		/>
	{/each}
	{#each column.solid as square (square.index)}
		<rect x={square.x} y={square.y} width={square.size} height={square.size} {fill} />
	{/each}
{/each}
