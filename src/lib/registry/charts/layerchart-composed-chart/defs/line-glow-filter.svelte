<script lang="ts">
	/** Soft outer-glow filter applied to a glowing line. */
	let { id }: { id: string } = $props();
</script>

<filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
	<feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
	<feColorMatrix
		in="blur"
		type="matrix"
		values="1 0 0 0 0
                0 1 0 0 0
                0 0 1 0 0
                0 0 0 2 0"
		result="glow"
	/>
	<feMerge>
		<feMergeNode in="glow" />
		<feMergeNode in="SourceGraphic" />
	</feMerge>
</filter>
