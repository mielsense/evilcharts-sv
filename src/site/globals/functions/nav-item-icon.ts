/**
 * Ported from `evilcharts/src/globals/functions/getNavItemIcon.tsx`.
 *
 * Custom icons for each item in the sidebar. Folder names arrive as a URL segment
 * (`area-chart`, …), so matching on the chart type keeps one case per chart across every provider.
 */
import type { Component } from 'svelte';
import {
	BackgroundIcon,
	BarChartIcon,
	BrushIcon,
	ChartConfigIcon,
	ChartLegendIcon,
	ChartStackedAreaIcon,
	ChartStackedLineIcon,
	ComposedChartIcon,
	DotsIcon,
	HouseIcon,
	HistoryIcon,
	PieChartIcon,
	RadarChartIcon,
	RadialChartIcon,
	SankeyChartIcon,
	ShapesIcon,
	SquareAddonIcon,
	TooltipIcon
} from '$site/assets/icons/index.js';
import type { SidebarOptionId } from '$site/globals/constants/docs-sidebar.js';

type IconComponent = Component<Record<string, unknown>>;

const CHART_ICONS: Record<string, IconComponent> = {
	'area-chart': ChartStackedAreaIcon as IconComponent,
	'line-chart': ChartStackedLineIcon as IconComponent,
	'bar-chart': BarChartIcon as IconComponent,
	'composed-chart': ComposedChartIcon as IconComponent,
	'pie-chart': PieChartIcon as IconComponent,
	'radial-chart': RadialChartIcon as IconComponent,
	'radar-chart': RadarChartIcon as IconComponent,
	'sankey-chart': SankeyChartIcon as IconComponent
};

/** `/docs/layerchart/area-chart` → the area-chart glyph. */
export function getNavItemIcon(url: string): IconComponent | undefined {
	return CHART_ICONS[url.split('/').filter(Boolean).pop() ?? ''];
}

/** The glyph for each hand-written sidebar option, from `docs-sidebar.tsx`. */
export const OPTION_ICONS: Record<SidebarOptionId, IconComponent> = {
	'get-started': HouseIcon as IconComponent,
	installation: SquareAddonIcon as IconComponent,
	components: ShapesIcon as IconComponent,
	changelog: HistoryIcon as IconComponent,
	background: BackgroundIcon as IconComponent,
	tooltip: TooltipIcon as IconComponent,
	legend: ChartLegendIcon as IconComponent,
	dots: DotsIcon as IconComponent,
	brush: BrushIcon as IconComponent,
	'chart-config': ChartConfigIcon as IconComponent
};
