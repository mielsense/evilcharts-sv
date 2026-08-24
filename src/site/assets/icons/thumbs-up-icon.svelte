<script lang="ts">
	/** ThumbsUpIcon, ported verbatim from the reference's `src/assets/icons/index.tsx`. */
	import type { SVGAttributes } from 'svelte/elements';

	let {
		fill = 'currentColor',
		secondaryfill,
		width = '1em',
		height = '1em',
		...rest
	}: {
		fill?: string;
		secondaryfill?: string;
		width?: string | number;
		height?: string | number;
	} & SVGAttributes<SVGSVGElement> = $props();

	/** The reference does `secondaryfill = secondaryfill || fill`. */
	const secondary = $derived(secondaryfill || fill);
</script>

<svg {height} {width} viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" {...rest}>
	<g {fill}>
		<path
			d="M16.811 9.4546C17.0627 8.5026 16.7973 7.50479 16.0836 6.79069C15.5494 6.25619 14.7945 6.00059 14.0388 6.00059H10.4705L11.3571 3.24719C11.7056 2.19469 11.2901 1.41069 10.8725 0.93339C10.5807 0.59999 10.0531 0.621588 9.7635 0.956888L5.6683 5.6985C5.2372 6.1976 5 6.8352 5 7.4947V13.2507C5 14.7695 6.2312 16.0007 7.75 16.0007H12.961C14.2086 16.0007 15.2998 15.1607 15.619 13.9547L16.81 9.45469L16.811 9.4546Z"
			fill={secondary}
			opacity="0.4"
		/>
		<path
			d="M5.5 7.7506V14.2506C5.5 15.2156 4.715 16.0006 3.75 16.0006H2.75C1.785 16.0006 1 15.2156 1 14.2506V7.7506C1 6.7856 1.785 6.0006 2.75 6.0006H3.75C4.715 6.0006 5.5 6.7856 5.5 7.7506Z"
			{fill}
		/>
	</g>
</svg>
