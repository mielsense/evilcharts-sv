import { describe, expect, it } from 'vitest';
import { ditherCells, normalizeDitherBounds } from './paint.js';

describe('family-agnostic dither cells', () => {
	it('aligns a clipped shape to the shared 2 CSS pixel grid', () => {
		const cells = Array.from(
			ditherCells({ x: 1, y: 1, width: 5, height: 5 }, { coverage: 1, cellSize: 2 })
		);

		expect(cells).toEqual([
			{ x: 0, y: 0, size: 2 },
			{ x: 2, y: 0, size: 2 },
			{ x: 4, y: 0, size: 2 },
			{ x: 0, y: 2, size: 2 },
			{ x: 2, y: 2, size: 2 },
			{ x: 4, y: 2, size: 2 },
			{ x: 0, y: 4, size: 2 },
			{ x: 2, y: 4, size: 2 },
			{ x: 4, y: 4, size: 2 }
		]);
	});

	it('paints exactly half of a 4 by 4 Bayer tile at 50 percent coverage', () => {
		const cells = Array.from(
			ditherCells({ x: 0, y: 0, width: 8, height: 8 }, { coverage: 0.5, cellSize: 2 })
		);

		expect(cells).toEqual([
			{ x: 0, y: 0, size: 2 },
			{ x: 4, y: 0, size: 2 },
			{ x: 2, y: 2, size: 2 },
			{ x: 6, y: 2, size: 2 },
			{ x: 0, y: 4, size: 2 },
			{ x: 4, y: 4, size: 2 },
			{ x: 2, y: 6, size: 2 },
			{ x: 6, y: 6, size: 2 }
		]);
	});

	it('lets one coverage function drive gradients across any clipped geometry', () => {
		const cells = Array.from(
			ditherCells(
				{ x: 0, y: 0, width: 8, height: 8 },
				{
					cellSize: 2,
					coverage: ({ relativeY }) => (relativeY < 0.5 ? 1 : 0)
				}
			)
		);

		expect(cells).toHaveLength(8);
		expect(cells.every((cell) => cell.y < 4)).toBe(true);
	});

	it('normalizes negative and non-finite geometry before rasterization', () => {
		expect(normalizeDitherBounds({ x: 10, y: 20, width: -4, height: -8 })).toEqual({
			x: 6,
			y: 12,
			width: 4,
			height: 8
		});
		expect(normalizeDitherBounds({ x: Number.NaN, y: 2, width: 4, height: 5 })).toEqual({
			x: 0,
			y: 2,
			width: 0,
			height: 0
		});
	});
});
