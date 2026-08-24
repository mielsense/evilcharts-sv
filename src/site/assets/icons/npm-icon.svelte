<script lang="ts">
	/** NpmIcon, ported verbatim from the reference's `src/assets/icons/index.tsx`. */
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

<svg {height} {width} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" {...rest}>
	<path
		d="m7.415 7.656 17.291.024-.011 17.29h-4.329l.012-12.974h-4.319l-.01 12.964H7.393zM3.207 1.004h-.005a2.2 2.2 0 0 0-2.198 2.198v25.596c0 1.214.984 2.198 2.198 2.198h25.596a2.2 2.2 0 0 0 2.198-2.198V3.202a2.2 2.2 0 0 0-2.198-2.198h-.006z"
		{fill}
	/>
</svg>
