/**
 * The component map the docs markdown may use bare.
 *
 * Mirrors `evilcharts/src/components/docs/mdx/index.tsx`, minus the HTML element overrides — those
 * are applied to the hast by `$site/lib/mdsvex-elements.ts`, because mdsvex cannot map a tag to a
 * component. `$site/lib/mdsvex-components.ts` injects an import of exactly the names each page
 * uses. Keep that module's `MDX_COMPONENTS` list in step with these exports.
 *
 * The reference's map also carries `Accordion*`, `LinkedCard`, `Kbd`, `Image` and `Description`,
 * which no page in the ported (recharts) half of the docs uses; they are exported here anyway so
 * the map stays a faithful superset.
 */
export { Tabs, TabsList, TabsPanel, TabsTab } from '$site/components/ui/tabs/index.js';
export { Kbd } from '$site/components/ui/kbd/index.js';

export { default as CodeTabs } from '$site/components/docs/charts/code-tabs.svelte';
export { default as CodeCollapsibleWrapper } from '$site/components/docs/charts/code-collapsible-wrapper.svelte';
export { default as ComponentPreview } from '$site/components/docs/charts/component-preview.svelte';
export { default as ComponentSource } from '$site/components/docs/charts/component-source.svelte';

export { default as Alert } from './components/alert.svelte';
export { default as AlertContent } from './components/alert-content.svelte';
export { default as ApiHeading } from './components/api-heading.svelte';
export { default as ApiRow } from './components/api-row.svelte';
export { default as ApiTable } from './components/api-table.svelte';
export { default as CliBlock } from './components/cli-block.svelte';
export { default as CodeBlock } from './components/code-block.svelte';
export { default as CommandBlock } from './components/command-block.svelte';
export { default as CopyButton } from './components/copy-button.svelte';
export { default as Description } from './components/text.svelte';
export { default as Image } from './components/image.svelte';
export { default as Link } from './components/link.svelte';
export { default as LinkedCard } from './components/linked-card.svelte';
export { default as ShowcaseGrid } from './components/showcase-grid.svelte';
export { default as Step } from './components/step.svelte';
export { default as StepContent } from './components/step-content.svelte';
export { default as StepDescription } from './components/step-description.svelte';
export { default as StepTitle } from './components/step-title.svelte';
export { default as Steps } from './components/steps.svelte';
export { default as LanguageIcon } from '$site/assets/language/language-icon.svelte';
