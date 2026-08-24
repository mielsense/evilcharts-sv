<script lang="ts">
	/** ReactIcon, ported verbatim from the reference's `src/assets/icons/index.tsx`. */
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

<svg
	{height}
	{width}
	viewBox="-11.5 -10.23174 23 20.46348"
	xmlns="http://www.w3.org/2000/svg"
	{...rest}
>
	<circle r="2.05" {fill} />
	<g stroke={fill} stroke-width="1" fill="none">
		<ellipse rx="11" ry="4.2" />
		<ellipse rx="11" ry="4.2" transform="rotate(60)" />
		<ellipse rx="11" ry="4.2" transform="rotate(120)" />
	</g>
</svg>
