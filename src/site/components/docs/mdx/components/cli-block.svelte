<script lang="ts">
	/**
	 * `CliBlock` from `evilcharts/src/components/docs/mdx/components/cli-block.tsx`.
	 *
	 * The commands are the shadcn-**svelte** CLI's, since that is what installs into a Svelte
	 * project; the reference's are `shadcn@latest`. Registry item names are resolved to their
	 * published URL, which is what `shadcn-svelte add` takes.
	 * See plans/DEVIATIONS.md D-4.
	 */
	import type { PackageManager } from '$site/hooks/use-config.svelte.js';
	import { SITE_URL } from '$site/lib/utils.js';
	import PackageManagerTabs from './package-manager-tabs.svelte';

	let { commands }: { commands: string[] } = $props();

	const PREFIXES: Record<PackageManager, string> = {
		npm: 'npx shadcn-svelte@latest add',
		yarn: 'yarn dlx shadcn-svelte@latest add',
		bun: 'bunx --bun shadcn-svelte@latest add',
		pnpm: 'pnpm dlx shadcn-svelte@latest add'
	};

	/** `@evilcharts/layerchart-area-chart` → the item's registry URL. */
	const resolved = $derived(
		commands.map((command) =>
			command.startsWith('@evilcharts/')
				? `${SITE_URL}/r/${command.slice('@evilcharts/'.length)}.json`
				: command
		)
	);
</script>

<PackageManagerTabs prefixes={PREFIXES} commands={resolved} copyButtonClass="-mt-1" />
