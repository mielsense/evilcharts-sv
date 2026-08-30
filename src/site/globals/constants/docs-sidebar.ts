/**
 * Ported from `evilcharts/src/globals/constants/docs-sidebar.tsx`.
 *
 * Most sidebar links now live under a provider segment, so these are functions of the active
 * provider rather than constants. Chart Config is the exception — it documents the config contract
 * both engines share, so it keeps a provider-free URL.
 *
 * Icons live in `sidebar-options.ts` beside these lists rather than inline, because this module is
 * also read by build tooling that cannot resolve components.
 */
import type { Provider } from './providers.js';

export type SidebarOptionId =
	| 'get-started'
	| 'installation'
	| 'agent-skill'
	| 'components'
	| 'changelog'
	| 'background'
	| 'tooltip'
	| 'legend'
	| 'dots'
	| 'brush'
	| 'chart-config';

export type SidebarOption = {
	id: SidebarOptionId;
	name: string;
	url: string;
};

export function getStartedOptions(provider: Provider): SidebarOption[] {
	return [
		{ id: 'get-started', name: 'Get Started', url: '/docs' },
		{ id: 'installation', name: 'Installation', url: `/docs/${provider}/installation` },
		{ id: 'agent-skill', name: 'Agent Skill', url: '/docs/agent-skill' },
		{ id: 'components', name: 'Components', url: `/docs/${provider}/components` },
		{ id: 'changelog', name: 'Changelog', url: '/docs/changelog' }
	];
}

export function getChartComponentOptions(provider: Provider): SidebarOption[] {
	// Every entry is gated by `existingUrls` in the sidebar, so links only appear where the page
	// exists — a provider without a Background page keeps it hidden.
	return [
		{ id: 'background', name: 'Background', url: `/docs/${provider}/ui/background` },
		{ id: 'tooltip', name: 'Tooltip', url: `/docs/${provider}/ui/tooltip` },
		{ id: 'legend', name: 'Legend', url: `/docs/${provider}/ui/legend` },
		{ id: 'dots', name: 'Dots', url: `/docs/${provider}/ui/dots` },
		{ id: 'brush', name: 'Brush', url: `/docs/${provider}/ui/brush` }
	];
}

export const DocumentationOptions: SidebarOption[] = [
	{ id: 'chart-config', name: 'Chart Config', url: '/docs/chart-config' }
];

/**
 * Pages reachable from the hard-coded groups above; `NavMain` skips them so they don't appear
 * twice. Provider-scoped entries are matched by suffix, since the leading `/docs/<provider>` varies.
 */
export const EXCLUDED_PAGE_SUFFIXES: string[] = [
	'/installation',
	'/agent-skill',
	'/components',
	'/changelog'
];

export function isExcludedPage(url: string): boolean {
	return EXCLUDED_PAGE_SUFFIXES.some((suffix) => url.endsWith(suffix));
}
