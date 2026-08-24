<script lang="ts">
	/**
	 * The radial bar series. Each data row becomes one bar, laid out from the inside out — row 0 is
	 * the innermost ring, which is how Recharts stacks them. Pass `isClickable` to make bars
	 * selectable.
	 */
	import { Arc, getChartContext } from 'layerchart';
	import { animate, useMotionValue, useReducedMotion } from '@humanspeak/svelte-motion';
	import { useRadialChart } from './radial-chart-context.svelte.js';
	import { untrack } from 'svelte';
	import {
		DEFAULT_BAR_SIZE,
		DEFAULT_CORNER_RADIUS,
		REVEAL_BEGIN,
		REVEAL_DURATION,
		REVEAL_EASE,
		getRings,
		getVariantConfig,
		interpolateRings,
		resolveRadius,
		toArcAngle,
		type RadialRing
	} from './types.js';

	let {
		dataKey,
		cornerRadius = DEFAULT_CORNER_RADIUS,
		barSize = DEFAULT_BAR_SIZE,
		showBackground = true,
		isClickable = false,
		radialBarProps,
		arcProps
	}: {
		dataKey: string; // value key — determines each bar's size
		cornerRadius?: number; // border radius of each bar's corners
		barSize?: number; // thickness of each radial bar
		showBackground?: boolean; // renders the unfilled track behind each bar
		isClickable?: boolean; // lets bars be selected by clicking them
		radialBarProps?: Record<string, unknown>; // canonical escape hatch, matching the original API
		/** @deprecated Use `radialBarProps`. */
		arcProps?: Record<string, unknown>; // escape hatch for raw LayerChart Arc props
	} = $props();

	const forwardedRadialBarProps = $derived({ ...(arcProps ?? {}), ...(radialBarProps ?? {}) });

	const chart = useRadialChart();
	const layer = getChartContext();
	const token = $props.id();
	// Devices set to "reduce motion" skip the intro entirely
	const shouldReduceMotion = useReducedMotion();

	/**
	 * The intro, reproducing `<RadialBar>`'s own animation: each bar's `endAngle` sweeps out from
	 * the chart's start angle over 1.5s with the CSS `ease` curve.
	 */
	const reveal = useMotionValue(1);
	let sourceRings = $state<RadialRing[]>([]);
	let targetRings = $state<RadialRing[]>([]);
	let previousLoading: boolean | undefined;

	// Push the value key up so the tooltip can read each bar's number.
	$effect.pre(() => {
		chart.registerValueKey(token, dataKey);
		return () => chart.registerValueKey(token, undefined);
	});

	const variantConfig = $derived(getVariantConfig(chart.variant));

	/**
	 * Recharts' `getMaxRadius`: half the smaller plot dimension, measured inside the chart margin.
	 * It does not shift with the `semi` variant's lower centre, so the radii are the same for both.
	 */
	// `layer.width` / `layer.height` are the plot box, already inside the chart's `padding`, so the
	// margin must not be subtracted a second time.
	const maxRadius = $derived(Math.min(layer.width, layer.height) / 2);

	const rings = $derived(
		getRings({
			rows: chart.data,
			dataKey,
			nameKey: chart.nameKey,
			innerRadius: resolveRadius(chart.innerRadius, maxRadius),
			outerRadius: resolveRadius(chart.outerRadius, maxRadius),
			barSize,
			startAngle: toArcAngle(variantConfig.startAngle),
			endAngle: toArcAngle(variantConfig.endAngle),
			max: chart.max
		})
	);

	// Recharts re-animates radial sectors whenever their geometry changes. Capture the currently
	// painted angles before each new tween so rapid updates cannot jump back to an older target.
	$effect(() => {
		const loadingNow = chart.isLoading;
		const nextRings = rings;
		const reduceMotion = shouldReduceMotion.current;
		let controls: ReturnType<typeof animate> | undefined;

		untrack(() => {
			if (loadingNow) {
				sourceRings = [];
				targetRings = [];
				reveal.set(1);
			} else {
				const entering = previousLoading === undefined || previousLoading;
				const currentRings = entering
					? []
					: interpolateRings(sourceRings, targetRings, reveal.get());

				sourceRings = currentRings;
				targetRings = nextRings;

				if (reduceMotion) {
					reveal.set(1);
				} else {
					reveal.set(0);
					controls = animate(reveal, 1, {
						delay: REVEAL_BEGIN / 1000,
						duration: REVEAL_DURATION / 1000,
						ease: REVEAL_EASE
					});
				}
			}
			previousLoading = loadingNow;
		});

		return () => controls?.stop();
	});

	const animatedRings = $derived(interpolateRings(sourceRings, targetRings, reveal.current));
	const isAnimating = $derived(
		!chart.isLoading && !shouldReduceMotion.current && reveal.current < 1
	);

	/**
	 * The chart's full sweep, for the track behind each bar.
	 *
	 * LayerChart defaults `trackEndAngle` to the *arc's* own `endAngle`, so the track ended exactly
	 * where the bar did and was completely hidden behind it. Recharts' background sector always
	 * spans the whole arc.
	 */
	const trackEndAngle = $derived(toArcAngle(variantConfig.endAngle));

	/**
	 * Everything each ring needs, resolved in one derivation rather than with declaration tags in
	 * the `{#each}`.
	 */
	const bars = $derived(
		animatedRings.map((ring) => ({
			...ring,
			fill: `url(#${chart.chartId}-radial-colors-${ring.name})`,
			opacity:
				isClickable && chart.selectedBar !== null && chart.selectedBar !== ring.name ? 0.15 : 1,
			value: Number(ring.row[dataKey] ?? 0)
		}))
	);

	function select(name: string, value: number) {
		if (!isClickable) return;
		// Clicking the selected bar clears the selection, otherwise selects it
		chart.selectBar(chart.selectedBar === name ? null : name, value);
	}

	function selectFromKeyboard(event: KeyboardEvent, name: string, value: number) {
		if (!isClickable || (event.key !== 'Enter' && event.key !== ' ')) return;
		event.preventDefault();
		select(name, value);
	}
</script>

<!-- The root renders the skeleton bar while loading, so the real bar steps aside -->
{#if !chart.isLoading}
	{#each bars as bar (bar.index)}
		<Arc
			class={['drop-shadow-sm transition-opacity duration-200', isClickable && 'cursor-pointer']
				.filter(Boolean)
				.join(' ')}
			data-evil-animation-state={isAnimating ? 'running' : 'idle'}
			startAngle={bar.startAngle}
			endAngle={bar.endAngle}
			innerRadius={bar.innerRadius}
			outerRadius={bar.outerRadius}
			{cornerRadius}
			fill={bar.fill}
			opacity={bar.opacity}
			track={showBackground}
			{trackEndAngle}
			data={bar.row}
			tooltip
			motion="none"
			role={isClickable ? 'button' : 'presentation'}
			tabindex={isClickable ? 0 : undefined}
			aria-label={isClickable ? `${bar.name}: ${bar.value}` : undefined}
			aria-pressed={isClickable ? chart.selectedBar === bar.name : undefined}
			onkeydown={(event: KeyboardEvent) => selectFromKeyboard(event, bar.name, bar.value)}
			onclick={() => select(bar.name, bar.value)}
			{...forwardedRadialBarProps}
		/>
	{/each}
{/if}
