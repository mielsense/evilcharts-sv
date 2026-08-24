<script lang="ts">
	/** `Alert` from `evilcharts/src/components/docs/mdx/components/alert.tsx`. */
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import {
		AlertIcon,
		CheckboxCheckedIcon,
		InfoIcon,
		WarningIcon
	} from '$site/assets/icons/index.js';
	import { cn } from '$site/lib/utils.js';
	import { ALERT_TITLES, alertVariants, type AlertVariant } from './alert-variants.js';

	let {
		class: className,
		variant = 'default',
		title,
		children,
		...rest
	}: {
		class?: string;
		variant?: AlertVariant;
		title?: string;
		children?: Snippet;
	} & Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children' | 'title'> = $props();

	/** The reference's `getAlertIcon` — `error` deliberately reuses the warning glyph. */
	const Icon = $derived(
		{
			default: AlertIcon,
			svelte: AlertIcon,
			warning: WarningIcon,
			info: InfoIcon,
			error: WarningIcon,
			success: CheckboxCheckedIcon
		}[variant]
	);
</script>

<div data-slot="alert" role="alert" class={cn(alertVariants({ variant }), className)} {...rest}>
	<div class="flex items-center gap-2 px-1.5 py-1 select-none">
		<span><Icon /></span>
		<span class="text-[13px]">{title ? title : ALERT_TITLES[variant]}</span>
	</div>
	{@render children?.()}
</div>
