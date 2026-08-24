<script lang="ts">
	/** CheckIcon, ported verbatim from the reference's `src/assets/icons/index.tsx`. */
	import type { SVGAttributes } from 'svelte/elements';

	let {
		fill = 'currentColor',
		width = '1em',
		height = '1em',
		...rest
	}: {
		fill?: string;
		width?: string | number;
		height?: string | number;
	} & SVGAttributes<SVGSVGElement> = $props();
</script>

<svg {height} {width} viewBox="-1 -2 20 20" xmlns="http://www.w3.org/2000/svg" {...rest}>
	<g {fill}>
		<path
			d="M6.5001 14C6.3077 14 6.1163 13.9268 5.9698 13.7803L2.21981 10.0303C1.92681 9.7373 1.92681 9.2627 2.21981 8.9698C2.51281 8.6769 2.98741 8.6768 3.28031 8.9698L6.50001 12.1895L14.7197 3.9698C15.0127 3.6768 15.4873 3.6768 15.7802 3.9698C16.0731 4.2628 16.0732 4.7374 15.7802 5.0303L7.03022 13.7803C6.88372 13.9268 6.6925 14 6.5001 14Z"
			{fill}
		/>
	</g>
</svg>
