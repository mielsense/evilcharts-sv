import { animate, useMotionValue } from '@humanspeak/svelte-motion';

type IntroTimelineOptions = {
	/** Total timeline length. Read when an intro starts so data-driven stagger spans stay accurate. */
	durationMs: () => number;
	isLoading: () => boolean;
};

type PlaybackControls = { stop: () => void };

/**
 * One uninterrupted entrance timeline shared by every mark in a Cartesian chart.
 *
 * LayerChart can remount SVG geometry while its scales and registered children settle. Keeping
 * elapsed time on the chart root means those remounts only read the current frame; they cannot
 * restart an easing curve, jump backwards, or consume the intro before a mark is ready.
 */
export function createIntroTimeline(options: IntroTimelineOptions) {
	const elapsed = useMotionValue(0);
	let controls: PlaybackControls | undefined;
	let started = false;
	let revision = $state(0);

	function reset() {
		controls?.stop();
		controls = undefined;
		started = false;
		elapsed.set(0);
	}

	function start() {
		if (started || options.isLoading()) return;
		started = true;
		revision += 1;
		const durationMs = Math.max(0, options.durationMs());
		elapsed.set(0);
		controls?.stop();
		controls = animate(elapsed, durationMs, {
			duration: durationMs / 1000,
			ease: 'linear'
		});
	}

	$effect(() => {
		if (options.isLoading()) reset();
	});

	$effect(() => () => controls?.stop());

	return {
		get elapsed() {
			return elapsed.current;
		},
		get revision() {
			return revision;
		},
		start
	};
}
