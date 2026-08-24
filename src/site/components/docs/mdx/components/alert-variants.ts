import { tv } from 'tailwind-variants';

/** Ported from `evilcharts/src/components/docs/mdx/components/alert.tsx`; classes verbatim. */
export const alertVariants = tv({
	base: 'relative w-full mt-4 rounded-md p-1 text-sm flex flex-col has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current',
	variants: {
		variant: {
			default: 'text-primary dark:bg-primary-foreground bg-[#F5F5F5]',
			svelte: 'text-svelte dark:bg-primary-foreground bg-svelte/10',
			warning: 'text-amber-500 dark:bg-primary-foreground bg-amber-500/10',
			info: 'text-blue-500 dark:bg-primary-foreground bg-blue-500/10',
			error: 'text-red-500 dark:bg-primary-foreground bg-red-500/10',
			success: 'text-green-500 dark:bg-primary-foreground bg-green-500/10'
		}
	},
	defaultVariants: { variant: 'default' }
});

export const alertContentVariants = tv({
	base: 'text-muted-foreground! bg-background flex w-full flex-col gap-1.5 rounded-[5px] border p-3 text-[13px] [&_p]:leading-6 [&_ul]:list-inside [&_ul]:list-disc [&_ul]:text-[13px]',
	variants: {
		variant: {
			default: 'border-muted-foreground/20 dark:border-border',
			svelte: 'border-svelte/25 dark:border-svelte/20',
			warning: 'border-amber-500/20 dark:border-border',
			info: 'border-blue-500/20 dark:border-border',
			error: 'border-red-500/20 dark:border-border',
			success: 'border-green-500/20 dark:border-border'
		}
	},
	defaultVariants: { variant: 'default' }
});

export type AlertVariant = 'default' | 'svelte' | 'warning' | 'info' | 'error' | 'success';

/** The reference's `getAlertTitle`. */
export const ALERT_TITLES: Record<AlertVariant, string> = {
	default: 'Note',
	svelte: 'Svelte 5 port',
	warning: 'Warning',
	info: 'Note',
	error: 'Error',
	success: 'Success'
};
