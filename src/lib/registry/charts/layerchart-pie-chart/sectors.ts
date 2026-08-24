/**
 * Sector angles for a pie, ported from Recharts' own `getSectors` arithmetic.
 *
 * LayerChart draws arcs with d3-pie, whose `padAngle` widens each arc and then relies on d3-arc to
 * inset the gap back out. That differs from Recharts twice over: d3-arc insets *inside* the
 * sector's own span (so the first sector no longer starts exactly at `startAngle`), and it ignores
 * a negative pad entirely (so `paddingAngle={-25}` loses its overlap). Recharts instead divides
 * `360° − paddingAngle × n` between the sectors and steps the start angle by `paddingAngle`
 * between them, which is what these numbers reproduce.
 */

export type PieSector = {
	/** Recharts-space start angle, in degrees. */
	startAngle: number;
	/** Recharts-space end angle, in degrees. */
	endAngle: number;
	row: Record<string, unknown>;
	index: number;
};

/** `sign × min(|end − start|, 360)`, as Recharts' `parseDeltaAngle` computes it. */
function parseDeltaAngle(startAngle: number, endAngle: number) {
	const sign = Math.sign(endAngle - startAngle) || 1;
	return sign * Math.min(Math.abs(endAngle - startAngle), 360);
}

export function getSectors({
	rows,
	dataKey,
	startAngle,
	endAngle,
	paddingAngle,
	minAngle = 0,
	progress = 1
}: {
	rows: Record<string, unknown>[];
	dataKey: string;
	startAngle: number;
	endAngle: number;
	paddingAngle: number;
	minAngle?: number;
	/**
	 * Intro progress, 0 → 1. Recharts scales every sector's span by it and lays the sectors
	 * end to end from the first one's start angle, so the pie unrolls as it grows.
	 */
	progress?: number;
}): PieSector[] {
	const valueOf = (row: Record<string, unknown>) => {
		const value = row[dataKey];
		return typeof value === 'number' && Number.isFinite(value) ? value : 0;
	};

	const deltaAngle = parseDeltaAngle(startAngle, endAngle);
	const absDeltaAngle = Math.abs(deltaAngle);
	const sign = Math.sign(deltaAngle) || 1;

	// A single sector has nothing to be padded against.
	const pad = rows.length <= 1 ? 0 : paddingAngle;
	const notZeroItemCount = rows.filter((row) => valueOf(row) !== 0).length;
	// A full turn pads after the last sector too, since it meets the first one again.
	const totalPaddingAngle = (absDeltaAngle >= 360 ? notZeroItemCount : notZeroItemCount - 1) * pad;
	const realTotalAngle = absDeltaAngle - notZeroItemCount * minAngle - totalPaddingAngle;

	const sum = rows.reduce((total, row) => total + valueOf(row), 0);
	if (sum <= 0) return [];

	let previousEnd = startAngle;

	return rows.map((row, index) => {
		const value = valueOf(row);
		const percent = value / sum;
		const sectorStart = index === 0 ? startAngle : previousEnd + sign * pad * (value !== 0 ? 1 : 0);
		const span = sign * ((value !== 0 ? minAngle : 0) + percent * realTotalAngle) * progress;
		const sectorEnd = sectorStart + span;

		previousEnd = sectorEnd;

		return { startAngle: sectorStart, endAngle: sectorEnd, row, index };
	});
}
