import { tv, type VariantProps } from 'tailwind-variants';

/**
 * Ported from `evilcharts/src/components/ui/sidebar.tsx`'s `sidebarMenuButtonVariants`;
 * classes verbatim.
 */
export const sidebarMenuButtonVariants = tv({
	base: 'peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-open:hover:bg-sidebar-accent data-open:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0',
	variants: {
		variant: {
			default: 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
			outline:
				'bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]'
		},
		size: {
			default: 'h-8 text-[13px]',
			sm: 'h-7 text-xs',
			lg: 'h-12 text-sm group-data-[collapsible=icon]:p-0!'
		}
	},
	defaultVariants: { variant: 'default', size: 'default' }
});

export type SidebarMenuButtonVariant = NonNullable<
	VariantProps<typeof sidebarMenuButtonVariants>['variant']
>;
export type SidebarMenuButtonSize = NonNullable<
	VariantProps<typeof sidebarMenuButtonVariants>['size']
>;
