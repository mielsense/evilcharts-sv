export type IntroAction = 'reset' | 'animate' | 'finish' | 'none';

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

/**
 * Builds a one-shot wipe animation anchored to the chart root's mount timestamp.
 * Keyed LayerChart remounts therefore resume at elapsed progress and can never jump backwards.
 */
export function getRevealAnimation(
	durationSeconds: number,
	ease: number[],
	startedAt: number,
	now = Date.now()
) {
	const durationMs = durationSeconds * 1000;
	const elapsed = Math.max(0, now - startedAt);
	if (elapsed >= durationMs) return null;

	const progress = durationMs > 0 ? elapsed / durationMs : 1;
	return {
		initial: { scaleX: progress },
		animate: { scaleX: 1 },
		transition: {
			duration: Math.max(0, durationSeconds - elapsed / 1000),
			ease
		}
	};
}
