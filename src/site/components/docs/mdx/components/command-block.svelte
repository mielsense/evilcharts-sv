<script lang="ts">
	/** `CommandBlock` from `evilcharts/src/components/docs/mdx/components/command-block.tsx`. */
	import type { PackageManager } from '$site/hooks/use-config.svelte.js';
	import PackageManagerTabs from './package-manager-tabs.svelte';

	let { commands }: { commands: string[] } = $props();

	const PREFIXES: Record<PackageManager, string> = {
		npm: 'npm install',
		yarn: 'yarn add',
		bun: 'bun add',
		pnpm: 'pnpm add'
	};
</script>

<PackageManagerTabs prefixes={PREFIXES} {commands} />
