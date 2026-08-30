<script lang="ts">
	import type { BackgroundVariant } from './types.js';
	let { variant }: { variant: BackgroundVariant } = $props();
	const id = $props.id();
	const patternId = $derived(`${id}-${variant}`);
	const maskId = $derived(`${id}-mask`);
	const filterId = $derived(`${id}-blur`);
</script>

<svg
	class="pointer-events-none absolute inset-0 h-full w-full"
	aria-hidden="true"
	preserveAspectRatio="none"
>
	<defs>
		<pattern
			id={patternId}
			width={variant === 'diagonal-lines'
				? 6
				: variant === 'plus' || variant === '4-pointed-star'
					? 16
					: variant === 'falling-triangles'
						? 18
						: variant === 'tiny-checkers'
							? 8
							: variant === 'overlapping-circles'
								? 40
								: variant === 'wiggle-lines'
									? 52
									: variant === 'bubbles'
										? 100
										: 20}
			height={variant === 'diagonal-lines'
				? 6
				: variant === 'plus' || variant === '4-pointed-star'
					? 16
					: variant === 'falling-triangles'
						? 36
						: variant === 'tiny-checkers'
							? 8
							: variant === 'overlapping-circles'
								? 40
								: variant === 'wiggle-lines'
									? 26
									: variant === 'bubbles'
										? 100
										: 20}
			patternUnits="userSpaceOnUse"
			patternTransform={variant === 'diagonal-lines'
				? 'rotate(45)'
				: variant === 'wiggle-lines'
					? 'scale(0.6)'
					: variant === 'bubbles'
						? 'scale(0.6667)'
						: undefined}
		>
			{#if variant === 'dots'}
				<circle class="text-border" cx="2" cy="2" r="1" fill="currentColor" />
			{:else if variant === 'grid'}
				<path
					class="text-border"
					d="M20 0H0V20"
					fill="none"
					stroke="currentColor"
					stroke-width="0.5"
				/>
			{:else if variant === 'cross-hatch'}
				<path
					class="text-border/60 dark:text-border/50"
					d="M0 0L20 20M20 0L0 20"
					fill="none"
					stroke="currentColor"
					stroke-width="0.5"
				/>
			{:else if variant === 'diagonal-lines'}
				<line
					class="text-border"
					x1="0"
					y1="0"
					x2="0"
					y2="6"
					stroke="currentColor"
					stroke-width="0.5"
				/>
			{:else if variant === 'plus'}
				<path
					class="text-border"
					d="M8 4V12M4 8H12"
					fill="none"
					stroke="currentColor"
					stroke-width="0.5"
					stroke-linecap="round"
				/>
			{:else if variant === 'falling-triangles'}
				<path
					class="text-border"
					d="M2 6h12L8 18 2 6zm18 36h12l-6 12-6-12z"
					transform="scale(0.5)"
					fill="currentColor"
					fill-opacity="0.4"
				/>
			{:else if variant === '4-pointed-star'}
				<polygon
					class="text-border"
					fill-rule="evenodd"
					points="5 3 8 4 5 5 4 8 3 5 0 4 3 3 4 0 5 3"
					fill="currentColor"
					fill-opacity="0.4"
				/>
			{:else if variant === 'tiny-checkers'}
				<path
					class="text-border"
					fill-rule="evenodd"
					d="M0 0h4v4H0V0zm4 4h4v4H4V4z"
					fill="currentColor"
					fill-opacity="0.2"
				/>
			{:else if variant === 'overlapping-circles'}
				<path
					class="text-border"
					fill-rule="evenodd"
					d="M25 25c0-2.762 2.238-5 5-5s5 2.238 5 5-2.238 5-5 5c0 2.762-2.238 5-5 5s-5-2.238-5-5 2.238-5 5-5zM5 5c0-2.762 2.238-5 5-5s5 2.238 5 5-2.238 5-5 5c0 2.762-2.238 5-5 5S0 12.762 0 10s2.238-5 5-5zm5 4c2.209 0 4-1.791 4-4s-1.791-4-4-4-4 1.791-4 4 1.791 4 4 4zm20 20c2.209 0 4-1.791 4-4s-1.791-4-4-4-4 1.791-4 4 1.791 4 4 4z"
					fill="currentColor"
					fill-opacity="0.4"
				/>
			{:else if variant === 'wiggle-lines'}
				<path
					class="text-border"
					d="M10 10c0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6h2c0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4v2c-3.314 0-6-2.686-6-6 0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6zm25.464-1.95l8.486 8.486-1.414 1.414-8.486-8.486 1.414-1.414z"
					fill="currentColor"
					fill-opacity="0.4"
				/>
			{:else}
				<path
					class="text-border"
					d="M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z"
					fill="currentColor"
					fill-opacity="0.4"
					fill-rule="evenodd"
				/>
			{/if}
		</pattern>
		<filter id={filterId}><feGaussianBlur stdDeviation="25" /></filter>
		<mask id={maskId} maskUnits="userSpaceOnUse">
			<rect x="8%" y="20%" width="85%" height="60%" fill="white" filter={`url(#${filterId})`} />
		</mask>
	</defs>
	<rect width="100%" height="100%" fill={`url(#${patternId})`} mask={`url(#${maskId})`} />
</svg>
