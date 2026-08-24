<script lang="ts">
	/**
	 * The npm/yarn/bun/pnpm tab strip shared by `<CliBlock>` and `<CommandBlock>`.
	 *
	 * The reference repeats this markup verbatim in both
	 * `evilcharts/src/components/docs/mdx/components/{cli-block,command-block}.tsx`; the two differ
	 * only in their command prefixes and in `<CliBlock>` nudging the copy button up by `-mt-1`.
	 * Factoring it out keeps the two ports from drifting. See plans/DEVIATIONS.md D-4.
	 */
	import { BunIcon, NpmIcon, PnpmIcon, YarnIcon } from '$site/assets/icons/index.js';
	import { Tabs, TabsList, TabsPanel, TabsTab } from '$site/components/ui/tabs/index.js';
	import { useConfig, type PackageManager } from '$site/hooks/use-config.svelte.js';
	import { cn } from '$site/lib/utils.js';
	import CopyButton from './copy-button.svelte';

	let {
		prefixes,
		commands,
		copyButtonClass
	}: {
		/** The command prefix per package manager, e.g. `npm install`. */
		prefixes: Record<PackageManager, string>;
		commands: string[];
		copyButtonClass?: string;
	} = $props();

	const config = useConfig();
	const managers = ['npm', 'yarn', 'bun', 'pnpm'] as const;
	const icons = { npm: NpmIcon, yarn: YarnIcon, bun: BunIcon, pnpm: PnpmIcon };

	const command = $derived(`${prefixes[config.packageManager]} ${commands.join(' ')}`);
</script>

<Tabs
	value={config.packageManager}
	onValueChange={(value) => config.setConfig({ packageManager: value as PackageManager })}
>
	<div class="group mt-2 flex flex-col rounded-[8px] bg-[#F5F5F5] p-1 dark:bg-primary-foreground">
		<div class="flex flex-row items-center justify-between pr-1 pl-2">
			<TabsList
				variant="underline"
				indicatorClassName={cn(
					config.packageManager === 'npm' && 'bg-[#C3292F]!',
					config.packageManager === 'yarn' && 'bg-[#3592BD]!',
					config.packageManager === 'bun' && 'bg-primary!',
					config.packageManager === 'pnpm' && 'bg-[#FAAF18]!'
				)}
			>
				{#each managers as manager (manager)}
					{@const Icon = icons[manager]}
					<TabsTab
						class={cn(
							'h-5! gap-2 px-1.5 hover:bg-transparent!',
							manager === 'npm' && 'data-active:text-[#C3292F]',
							manager === 'yarn' && 'data-active:text-[#3592BD]',
							manager === 'bun' && 'data-active:text-primary',
							manager === 'pnpm' && 'data-active:text-[#FAAF18]'
						)}
						value={manager}
					>
						<Icon class="size-3" />
						{manager}
					</TabsTab>
				{/each}
			</TabsList>
			<CopyButton class={copyButtonClass} code={command} />
		</div>
		<div
			class="no-scrollbar overflow-x-auto rounded-[5px] border bg-background p-3 text-[13px] text-muted-foreground"
		>
			{#each managers as manager (manager)}
				<TabsPanel class="font-mono whitespace-nowrap" value={manager}>
					{command}
				</TabsPanel>
			{/each}
		</div>
	</div>
</Tabs>
