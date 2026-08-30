export const SITE_NAME = 'Evil Charts';

export const SITE_TITLE = 'Evil Charts for Svelte | Animated chart components';

export const SITE_DESCRIPTION =
	'Open-source Svelte 5 chart components built with LayerChart or ECharts, shadcn-svelte, and Tailwind CSS.';

export const SITE_KEYWORDS: string[] = [
	'evil charts',
	'evilcharts',
	'charts',
	'svelte charts',
	'shadcn charts',
	'shadcn-svelte charts',
	'layerchart',
	'echarts',
	'tailwind charts',
	'animated charts',
	'bar chart',
	'line chart',
	'pie chart',
	'area chart',
	'radar chart',
	'radial chart',
	'sankey chart',
	'composed chart',
	'data visualization',
	'chart components',
	'open source charts'
];

/** The React project this is a port of. Credited on the landing page, in the docs and in the README. */
export const UPSTREAM_NAME = 'EvilCharts';
export const UPSTREAM_AUTHOR = 'Gurbinder';
export const UPSTREAM_AUTHOR_URL = 'https://x.com/legionsdev';
export const UPSTREAM_REPO_URL = 'https://github.com/legions-developer/evilcharts';
export const UPSTREAM_SITE_URL = 'https://evilcharts.com';

/** This port. */
export const PORT_AUTHOR = 'Mathis';
export const PORT_AUTHOR_URL = 'https://github.com/mielsense';
export const PORT_REPO_URL = 'https://github.com/mielsense/evilcharts-sv';
export const PORT_ISSUES_URL = 'https://github.com/mielsense/evilcharts-sv/issues';
export const PORT_REPO_API_URL = 'https://api.github.com/repos/mielsense/evilcharts-sv';
export const PORT_SITE_URL = 'https://evilcharts-sv.vercel.app';
/** Last verified on 2026-08-24. Used when GitHub does not return a numeric count. */
export const PORT_STARS_FALLBACK = 1;

export function formatGithubStarsLabel(stars: number) {
	return `${stars} GitHub ${stars === 1 ? 'star' : 'stars'}`;
}
