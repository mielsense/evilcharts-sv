<script lang="ts">
	/** CopyIcon, ported verbatim from the reference's `src/assets/icons/index.tsx`. */
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
			d="M11.75 14.5H4.25C3.5605 14.5 3 13.9395 3 13.25V6.75C3 6.3359 2.6641 6 2.25 6C1.8359 6 1.5 6.3359 1.5 6.75V13.25C1.5 14.7666 2.7334 16 4.25 16H11.75C12.1641 16 12.5 15.6641 12.5 15.25C12.5 14.8359 12.1641 14.5 11.75 14.5Z"
			fill={secondary}
			opacity="0.4"
		/>
		<path
			d="M13.75 2H7.25C5.73122 2 4.5 3.23122 4.5 4.75V10.25C4.5 11.7688 5.73122 13 7.25 13H13.75C15.2688 13 16.5 11.7688 16.5 10.25V4.75C16.5 3.23122 15.2688 2 13.75 2Z"
			opacity="0.5"
		/>
	</g>
</svg>
