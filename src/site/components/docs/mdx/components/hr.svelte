<script lang="ts">
	/** `Hr` from `evilcharts/src/components/docs/mdx/components/hr.tsx`. */
	import type { HTMLAttributes } from 'svelte/elements';

	let { ...rest }: HTMLAttributes<HTMLHRElement> = $props();
</script>

<hr class="my-4 md:my-8" {...rest} />
