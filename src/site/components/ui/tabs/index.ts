/** The reference exports both the Base UI names and the shadcn aliases; so does this. */
export { default as Tabs } from './tabs.svelte';
export { default as TabsList } from './tabs-list.svelte';
export { default as TabsTab, default as TabsTrigger } from './tabs-tab.svelte';
export { default as TabsPanel, default as TabsContent } from './tabs-panel.svelte';
export { TabsState, useTabs, type TabsOrientation } from './tabs-context.svelte.js';
