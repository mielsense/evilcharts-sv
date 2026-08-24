<script lang="ts">
	import DitherDomLayer from './dither-dom-layer.svelte';

	let clicked = $state(0);
</script>

<div
	class="lc-root-container"
	style="position: relative; width: 120px; height: 80px; --color-series-0: rgb(255 62 0);"
>
	<div style="position: absolute; inset: 10px 10px 10px 20px; overflow: hidden; z-index: 0;">
		<DitherDomLayer animate={false} ditherVariant="solid" />
	</div>
	<svg
		class="lc-layout-svg"
		width="120"
		height="80"
		style="position: absolute; inset: 0; z-index: 1;"
	>
		<g transform="translate(20 10)">
			<g transform="translate(12 8)">
				<path
					data-evil-dither-mark="fill"
					data-evil-dither-key="series"
					data-evil-dither-variant="solid"
					d="M0 0H24V20H0Z"
					fill="transparent"
					opacity="1"
					role="button"
					tabindex="0"
					onclick={() => (clicked += 1)}
					onkeydown={(event) => event.key === 'Enter' && (clicked += 1)}
				></path>
			</g>
		</g>
	</svg>
</div>

<output data-testid="clicked">{clicked}</output>
