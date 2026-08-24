<script lang="ts">
	/** SidebarLeft, ported verbatim from the reference's `src/assets/icons/index.tsx`. */
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
			d="M14.2501 15.5H3.75012C2.23352 15.5 1.00012 14.2666 1.00012 12.75V5.25C1.00012 3.7334 2.23352 2.5 3.75012 2.5H14.2501C15.7667 2.5 17.0001 3.7334 17.0001 5.25V12.75C17.0001 14.2666 15.7667 15.5 14.2501 15.5Z"
			fill={secondary}
			opacity="0.4"
		/>
		<path
			d="M6.25012 4.5H3.75012C3.33591 4.5 3.00012 4.83579 3.00012 5.25V12.75C3.00012 13.1642 3.33591 13.5 3.75012 13.5H6.25012C6.66434 13.5 7.00012 13.1642 7.00012 12.75V5.25C7.00012 4.83579 6.66434 4.5 6.25012 4.5Z"
			{fill}
		/>
	</g>
</svg>
