<script lang="ts">
	/** Ported from `evilcharts/src/components/docs/charts/code-tabs.tsx`. */
	import type { Snippet } from 'svelte';
	import { Tabs } from '$site/components/ui/tabs/index.js';
	import { useConfig, type InstallationType } from '$site/hooks/use-config.svelte.js';

	let { children }: { children?: Snippet } = $props();

	const config = useConfig();
</script>

<Tabs
	class="relative mt-4 w-full"
	value={config.installationType}
	onValueChange={(value) => config.setConfig({ installationType: value as InstallationType })}
>
	{@render children?.()}
</Tabs>
