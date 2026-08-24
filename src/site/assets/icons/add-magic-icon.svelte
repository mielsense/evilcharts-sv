<script lang="ts">
	/** AddMagicIcon, ported verbatim from the reference's `src/assets/icons/index.tsx`. */
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
			d="m14,9.25c0-.3076-.1885-.5845-.4746-.6973l-3.8184-1.5103-1.5098-3.8184c-.1133-.2861-.3896-.4741-.6973-.4741s-.584.188-.6973.4741l-1.5107,3.8184-3.8174,1.5103c-.2861.1128-.4746.3896-.4746.6973s.1885.5845.4746.6973l3.8174,1.5103,1.5107,3.8184c.1133.2861.3896.4741.6973.4741s.584-.188.6973-.4741l1.5098-3.8184,3.8184-1.5103c.2861-.1128.4746-.3896.4746-.6973Z"
			fill={secondary}
			opacity=".4"
			stroke-width="0"
		/>
		<path
			d="m16,13.5h-1v-1c0-.4141-.3359-.75-.75-.75s-.75.3359-.75.75v1h-1c-.4141,0-.75.3359-.75.75s.3359.75.75.75h1v1c0,.4141.3359.75.75.75s.75-.3359.75-.75v-1h1c.4141,0,.75-.3359.75-.75s-.3359-.75-.75-.75Z"
			{fill}
			stroke-width="0"
		/>
		<circle cx="14" cy="4" {fill} r="2.5" stroke-width="0" />
	</g>
</svg>
