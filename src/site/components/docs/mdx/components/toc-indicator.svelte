<script lang="ts">
	/**
	 * `TocIndicator` from `evilcharts/src/components/docs/mdx/components/toc-indicator.tsx`.
	 *
	 * The three springs (progress along the path, the tail's rotation and its margin) are
	 * `useSpring` from `@humanspeak/svelte-motion` with the reference's config; the path, mask,
	 * markers and gradient are its markup node for node.
	 */
	import { untrack } from 'svelte';
	import { useSpring } from '@humanspeak/svelte-motion';
	import type { TocEntry } from '$site/lib/source.js';
	import { cn } from '$site/lib/utils.js';
	import {
		generatePathData,
		getActiveDistance,
		GRADIENT_HEIGHT,
		SPRING_CONFIG,
		STARTING_MARGIN,
		type RowMetrics
	} from './toc-indicator.svelte.js';

	let {
		toc,
		activeIndex,
		rows,
		class: className
	}: {
		toc: TocEntry[];
		activeIndex: number;
		rows: RowMetrics[];
		class?: string;
	} = $props();

	const geometry = $derived(generatePathData(toc, rows));
	const activeDistance = $derived(getActiveDistance(activeIndex, geometry.itemCenterDistances));
	const isActive = $derived(activeDistance > 0);

	const animatedDistance = useSpring(0, SPRING_CONFIG);
	const tailRotate = useSpring(90, SPRING_CONFIG);
	const tailMarginTop = useSpring(-38, SPRING_CONFIG);

	// Seeded once with the mount-time index; the effect below tracks it from then on.
	let previousActiveIndex = untrack(() => activeIndex);

	$effect(() => {
		if (activeIndex !== previousActiveIndex) {
			const movingDown = activeIndex > previousActiveIndex;
			tailRotate.set(movingDown ? 90 : -90);
			tailMarginTop.set(movingDown ? -38 : -38 + 70);
			previousActiveIndex = activeIndex;
		}
		animatedDistance.set(activeDistance);
	});

	const offsetDistancePercent = $derived(
		geometry.totalLength > 0 ? `${(animatedDistance.current / geometry.totalLength) * 100}%` : '0%'
	);

	// The gradient moves with progress but keeps a fixed height.
	const startY = $derived(rows.length > 0 ? rows[0].top - STARTING_MARGIN : 0);
	const gradientY2 = $derived(startY + animatedDistance.current);
	const gradientY1 = $derived(Math.max(0, gradientY2 - GRADIENT_HEIGHT));

	const cssOffsetPath = $derived(`path('${geometry.path}')`);
</script>

<div
	style="mask-image: linear-gradient(to bottom, transparent 0px, currentColor 15px, currentColor 100%)"
	class={cn('pointer-events-none absolute h-full w-full text-path', className)}
>
	<svg class="h-full w-full" overflow="visible">
		<defs>
			<marker id="toc-end-circle" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
				<circle cx="3" cy="3" r="2" fill="currentColor" />
			</marker>
			<mask id="toc-path-mask" maskUnits="userSpaceOnUse">
				<path
					d={geometry.path}
					stroke="white"
					stroke-width="1"
					fill="none"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</mask>
			<linearGradient
				id="toc-progress-gradient"
				gradientUnits="userSpaceOnUse"
				x1="0"
				x2="0"
				y1={gradientY1}
				y2={gradientY2}
			>
				<stop offset="0%" stop-color="var(--primary)" stop-opacity="0" />
				<stop offset="100%" stop-color="var(--primary)" stop-opacity="1" />
			</linearGradient>
		</defs>
		<path
			d={geometry.path}
			stroke="currentColor"
			stroke-width="1"
			fill="none"
			marker-end="url(#toc-end-circle)"
		/>
	</svg>
	<div
		class="pointer-events-none absolute inset-0"
		style="mask: url(#toc-path-mask); -webkit-mask: url(#toc-path-mask)"
	>
		<div
			id="gradient-tail-of-toc-indicator"
			class="absolute top-0 left-0"
			style={`width:80px;height:80px;offset-path:${cssOffsetPath};offset-anchor:50% 50%;offset-rotate:0deg;` +
				`transform:rotate(${tailRotate.current}deg);margin-left:0.2px;margin-top:${tailMarginTop.current}px;` +
				`offset-distance:${offsetDistancePercent};opacity:${isActive ? 1 : 0}`}
		>
			<svg width="80" height="80" viewBox="0 0 80 80" class="overflow-visible">
				<defs>
					<radialGradient
						id="toc-glow-radial"
						cx="0.5"
						cy="0.5"
						fx="0.9"
						gradientUnits="objectBoundingBox"
					>
						<stop offset="0%" stop-color="var(--primary)" stop-opacity="1" />
						<stop offset="100%" stop-color="transparent" stop-opacity="1" />
					</radialGradient>
				</defs>
				<ellipse cx="40" cy="40" rx="40" ry="40" fill="url(#toc-glow-radial)" />
			</svg>
		</div>
	</div>
	<!--
		No vertical nudge: offset-anchor already rides the box's centre along the path, and the path
		hits each row's true centre — the reference's old -3 was there to cancel a fudge factor in a
		hand-rolled row geometry it no longer uses.
	-->
	<div
		class="absolute top-0 left-0 size-[6px] rounded-[1px] bg-primary"
		style={`offset-path:${cssOffsetPath};offset-anchor:50% 50%;offset-rotate:0deg;transform:rotate(45deg);margin-left:0.2px;` +
			`offset-distance:${offsetDistancePercent};opacity:${isActive ? 1 : 0}`}
	></div>
</div>
