<script lang="ts">
	/** Soft outer glow filter applied to a radar when `isGlowing` is set. */
	let { id, dataKey }: { id: string; dataKey: string } = $props();
</script>

<filter id={`${id}-radar-glow-${dataKey}`} x="-50%" y="-50%" width="200%" height="200%">
	<feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
	<feColorMatrix
		in="blur"
		type="matrix"
		values="1 0 0 0 0
                0 1 0 0 0
                0 0 1 0 0
                0 0 0 0.6 0"
		result="glow"
	/>
	<feMerge>
		<feMergeNode in="glow" />
		<feMergeNode in="SourceGraphic" />
	</feMerge>
</filter>
