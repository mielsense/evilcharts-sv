export type IntroAction = 'reset' | 'animate' | 'finish' | 'none';

export type CubicBezier = [number, number, number, number];

/** Evaluates a CSS cubic-bezier curve at an input time. */
export function cubicBezierProgress(
	progress: number,
	x1: number,
	y1: number,
	x2: number,
	y2: number
): number {
	const target = Math.min(1, Math.max(0, progress));
	const sample = (time: number, control1: number, control2: number) => {
		const inverse = 1 - time;
		return (
			3 * inverse * inverse * time * control1 +
			3 * inverse * time * time * control2 +
			time * time * time
		);
	};

	let low = 0;
	let high = 1;
	for (let index = 0; index < 14; index += 1) {
		const middle = (low + high) / 2;
		if (sample(middle, x1, x2) < target) low = middle;
		else high = middle;
	}

	return sample((low + high) / 2, y1, y2);
}

/** Maps a chart-owned linear timeline to the original EvilCharts reveal easing. */
export function revealProgress(
	elapsedMs: number,
	durationSeconds: number,
	ease: CubicBezier
): number {
	const durationMs = Math.max(0, durationSeconds * 1000);
	const linear = durationMs === 0 ? 1 : elapsedMs / durationMs;
	if (linear <= 0) return 0;
	if (linear >= 1) return 1;
	return cubicBezierProgress(linear, ...ease);
}

/** Returns the two percentage coordinates needed to paint a directional reveal mask. */
export function revealMaskRects(
	type: 'left-to-right' | 'right-to-left' | 'center-out' | 'edges-in',
	progress: number
): Array<{ x: number; width: number }> {
	const visible = Math.min(1, Math.max(0, progress));
	if (type === 'right-to-left') return [{ x: (1 - visible) * 100, width: visible * 100 }];
	if (type === 'center-out') return [{ x: (1 - visible) * 50, width: visible * 100 }];
	if (type === 'edges-in') {
		return [
			{ x: 0, width: visible * 50 },
			{ x: (1 - visible / 2) * 100, width: visible * 50 }
		];
	}
	return [{ x: 0, width: visible * 100 }];
}

type BarRevealDirection = 'none' | 'left-to-right' | 'right-to-left' | 'center-out' | 'edges-in';

/** Longest possible stagger span for a Cartesian bar chart. */
export function barIntroDurationMs(
	dataLength: number,
	growDurationSeconds: number,
	staggerSeconds: number
): number {
	return (
		(Math.max(0, growDurationSeconds) + Math.max(0, dataLength - 1) * Math.max(0, staggerSeconds)) *
		1000
	);
}

/** Derives one bar's eased grow progress from the chart-owned linear timeline. */
export function barGrowProgress(
	animationType: BarRevealDirection,
	index: number,
	dataLength: number,
	elapsedMs: number,
	growDurationSeconds: number,
	staggerSeconds: number,
	ease: CubicBezier
): number | null {
	if (animationType === 'none' || index < 0 || dataLength <= 0) return null;

	const lastIndex = dataLength - 1;
	const center = lastIndex / 2;
	let step: number;
	switch (animationType) {
		case 'right-to-left':
			step = lastIndex - index;
			break;
		case 'center-out':
			step = Math.abs(index - center);
			break;
		case 'edges-in':
			step = center - Math.abs(index - center);
			break;
		default:
			step = index;
	}

	const startMs = step * Math.max(0, staggerSeconds) * 1000;
	const durationMs = Math.max(0, growDurationSeconds) * 1000;
	const linear = durationMs === 0 ? 1 : (elapsedMs - startMs) / durationMs;
	return cubicBezierProgress(linear, ...ease);
}

/** Decides how a polar mark responds to the chart loading lifecycle. */
export function polarIntroAction(
	wasLoading: boolean | undefined,
	isLoading: boolean,
	reduceMotion: boolean
): IntroAction {
	if (isLoading) return 'reset';
	if (reduceMotion) return 'finish';
	if (wasLoading === undefined || wasLoading) return 'animate';
	return 'none';
}
