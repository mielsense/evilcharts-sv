<script lang="ts">
	/**
	 * Declares the hovered/active point marker for the <Area /> it is composed
	 * inside. Like <Dot />, it is a configuration slot and renders nothing itself.
	 */
	import { useAreaSlots } from './area-slots.svelte.js';
	import type { DotVariant } from '../../ui/layerchart-dot/types.js';

	let { variant }: { variant?: DotVariant } = $props();

	const slots = useAreaSlots();
	const token = $props.id();

	$effect.pre(() => {
		slots.registerActiveDot(token, variant);
		return () => slots.unregisterActiveDot(token);
	});
</script>
