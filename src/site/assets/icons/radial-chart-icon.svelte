<script lang="ts">
	/** RadialChartIcon, ported verbatim from the reference's `src/assets/icons/index.tsx`. */
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
		<!-- Outer arc -->
		<path
			d="M9 1C13.4183 1 17 4.58172 17 9C17 13.4183 13.4183 17 9 17C4.58172 17 1 13.4183 1 9C1 4.58172 4.58172 1 9 1ZM9 3C5.68629 3 3 5.68629 3 9C3 12.3137 5.68629 15 9 15C12.3137 15 15 12.3137 15 9C15 5.68629 12.3137 3 9 3Z"
			fill={secondary}
			fill-opacity="0.4"
		/>
		<!-- Middle arc -->
		<path
			d="M9 4C11.7614 4 14 6.23858 14 9C14 11.7614 11.7614 14 9 14C6.23858 14 4 11.7614 4 9C4 6.23858 6.23858 4 9 4ZM9 5.5C7.067 5.5 5.5 7.067 5.5 9C5.5 10.933 7.067 12.5 9 12.5C10.933 12.5 12.5 10.933 12.5 9C12.5 7.067 10.933 5.5 9 5.5Z"
			{fill}
		/>
		<!-- Inner arc -->
		<path
			d="M9 6.5C10.3807 6.5 11.5 7.61929 11.5 9C11.5 10.3807 10.3807 11.5 9 11.5C7.61929 11.5 6.5 10.3807 6.5 9C6.5 7.61929 7.61929 6.5 9 6.5ZM9 7.5C8.17157 7.5 7.5 8.17157 7.5 9C7.5 9.82843 8.17157 10.5 9 10.5C9.82843 10.5 10.5 9.82843 10.5 9C10.5 8.17157 9.82843 7.5 9 7.5Z"
			fill={secondary}
			fill-opacity="0.5"
		/>
	</g>
</svg>
