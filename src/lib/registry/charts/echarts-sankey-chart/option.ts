import type { SankeySeriesOption } from 'echarts/charts';
import type { TooltipComponentOption } from 'echarts/components';
import type { ComposeOption } from 'echarts/core';
import * as echarts from 'echarts/core';
import {
	getColorsCount,
	withAlpha,
	type ChartConfig,
	type ResolvedColors
} from '../../ui/echarts-chart/index.js';
import {
	resolveTooltipPosition,
	roundnessClass,
	tooltipIndicatorHtml,
	tooltipRow,
	tooltipVariantClass
} from '../../ui/echarts-tooltip/index.js';
import {
	DEFAULT_ITERATIONS,
	DEFAULT_LINK_CURVATURE,
	DEFAULT_NODE_PADDING,
	DEFAULT_NODE_WIDTH,
	type LinkRegistration,
	type NodeLabelRegistration,
	type NodeRegistration,
	type SankeyAnimationType,
	type SankeyData,
	type TooltipRegistration
} from './types.js';

export type EChartsSankeyOption = ComposeOption<SankeySeriesOption | TooltipComponentOption>;
type SankeyNodeItem = NonNullable<SankeySeriesOption['data']>[number];
type SankeyEdgeItem = NonNullable<SankeySeriesOption['links']>[number];
type Paint = string | echarts.graphic.LinearGradient;

const GRAY = 'rgba(120, 120, 120, 1)';
const NODE_DIM_OPACITY = 0.3;
const LINK_FILL_OPACITY = 0.4;
const LINK_DIM_OPACITY = 0.05;
const LABEL_DIM_OPACITY = 0.3;
const INTRO_COLUMN_STAGGER = 130;
const INTRO_NODE_GROW = 340;
const INTRO_LINK_DELAY = 90;
const INTRO_LINK_DRAW = 520;
const INTRO_FEATHER = 0.05;
const INTRO_NODE_SCALE_FROM = 0.8;

const SKELETON_NODES = [
	{ name: 's0' },
	{ name: 's1' },
	{ name: 's2' },
	{ name: 'm0' },
	{ name: 'm1' },
	{ name: 'm2' },
	{ name: 'e0' },
	{ name: 'e1' }
];
const SKELETON_LINKS = [
	{ source: 's0', target: 'm0', value: 8 },
	{ source: 's0', target: 'm1', value: 5 },
	{ source: 's1', target: 'm1', value: 7 },
	{ source: 's1', target: 'm2', value: 4 },
	{ source: 's2', target: 'm1', value: 5 },
	{ source: 's2', target: 'm2', value: 6 },
	{ source: 'm0', target: 'e0', value: 7 },
	{ source: 'm1', target: 'e0', value: 9 },
	{ source: 'm1', target: 'e1', value: 6 },
	{ source: 'm2', target: 'e1', value: 8 }
];

export type IntroState = { elapsed: number; depths: Record<string, number> };
export type SankeyRevealState = {
	hasRevealed: boolean;
	isLoading: boolean;
	animation: boolean;
	animationType: SankeyAnimationType;
	reducedMotion: boolean;
};
export type SankeyOptionContext = {
	data: SankeyData;
	config: ChartConfig;
	node: NodeRegistration;
	label: NodeLabelRegistration | null;
	link: LinkRegistration;
	tooltip?: TooltipRegistration;
	selectedNode: string | null;
	nodeWidth: number;
	nodePadding: number;
	linkCurvature: number;
	iterations: number;
	align: 'left' | 'justify';
	isLoading: boolean;
	resolved: ResolvedColors;
	nodeValues: Record<string, number>;
	intro: IntroState | null;
};

export function getSankeyRevealDecision(state: SankeyRevealState): {
	hasRevealed: boolean;
	shouldReveal: boolean;
} {
	if (state.isLoading) return { hasRevealed: false, shouldReveal: false };
	if (state.hasRevealed) return { hasRevealed: true, shouldReveal: false };
	return {
		hasRevealed: true,
		shouldReveal: state.animation && state.animationType !== 'none' && !state.reducedMotion
	};
}

export function computeNodeDepths(data: SankeyData): Record<string, number> {
	const depths = Object.fromEntries(data.nodes.map((node) => [node.name, 0]));
	for (let pass = 0; pass < data.nodes.length; pass += 1) {
		let changed = false;
		for (const link of data.links) {
			const source = data.nodes[link.source]?.name;
			const target = data.nodes[link.target]?.name;
			if (!source || !target) continue;
			if (depths[target] < depths[source] + 1) {
				depths[target] = depths[source] + 1;
				changed = true;
			}
		}
		if (!changed) break;
	}
	return depths;
}

export function sankeyIntroDuration(depths: Record<string, number>): number {
	const maxDepth = Math.max(0, ...Object.values(depths));
	return Math.max(
		maxDepth * INTRO_COLUMN_STAGGER + INTRO_NODE_GROW,
		Math.max(0, maxDepth - 1) * INTRO_COLUMN_STAGGER + INTRO_LINK_DELAY + INTRO_LINK_DRAW
	);
}

export function computeNodeValues(data: SankeyData): Record<string, number> {
	return Object.fromEntries(
		data.nodes.map((node, index) => {
			let incoming = 0;
			let outgoing = 0;
			for (const link of data.links) {
				if (link.source === index) outgoing += link.value;
				if (link.target === index) incoming += link.value;
			}
			return [node.name, outgoing > 0 ? outgoing : incoming];
		})
	);
}

function nodeGradient(colors: string[]): Paint {
	if (colors.length <= 1) return colors[0] ?? GRAY;
	return new echarts.graphic.LinearGradient(
		0,
		0,
		0,
		1,
		colors.map((color, index) => ({ offset: index / (colors.length - 1), color }))
	);
}

function linkPaint(context: SankeyOptionContext, source: string, target: string): Paint {
	const sourceColors = context.resolved.series[source] ?? [GRAY];
	const targetColors = context.resolved.series[target] ?? [GRAY];
	switch (context.link.variant) {
		case 'gradient':
			return new echarts.graphic.LinearGradient(0, 0, 1, 0, [
				{ offset: 0, color: withAlpha(sourceColors[0] ?? GRAY, 0.2) },
				{ offset: 0.5, color: withAlpha(sourceColors[0] ?? GRAY, 0.5) },
				{ offset: 1, color: withAlpha(targetColors[0] ?? GRAY, 0.2) }
			]);
		case 'source':
			return nodeGradient(sourceColors);
		case 'target':
			return nodeGradient(targetColors);
		case 'solid':
			return context.resolved.tokens.foreground;
	}
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const easeOut = (value: number) => 1 - (1 - value) ** 3;
function nodePhase(intro: IntroState | null, name: string) {
	if (!intro) return 1;
	return easeOut(
		clamp01((intro.elapsed - (intro.depths[name] ?? 0) * INTRO_COLUMN_STAGGER) / INTRO_NODE_GROW)
	);
}
function linkPhase(intro: IntroState | null, source: string) {
	if (!intro) return 1;
	const start = (intro.depths[source] ?? 0) * INTRO_COLUMN_STAGGER + INTRO_LINK_DELAY;
	return easeOut(clamp01((intro.elapsed - start) / INTRO_LINK_DRAW));
}

function paintAxis(paint: Paint): 'x' | 'y' | null {
	if (typeof paint === 'string') return null;
	const horizontal = Math.abs((paint.x2 ?? 0) - (paint.x ?? 0));
	const vertical = Math.abs((paint.y2 ?? 0) - (paint.y ?? 0));
	return horizontal >= vertical ? 'x' : 'y';
}

function paintStops(paint: Paint): { offset: number; color: string }[] {
	if (typeof paint === 'string') {
		return [
			{ offset: 0, color: paint },
			{ offset: 1, color: paint }
		];
	}
	const stops = paint.colorStops ?? [];
	return stops.length > 0
		? stops.map((stop) => ({ offset: stop.offset, color: stop.color }))
		: [{ offset: 0, color: GRAY }];
}

function sampleStops(stops: { offset: number; color: string }[], at: number): string {
	const first = stops[0];
	const last = stops[stops.length - 1];
	if (!first || !last) return GRAY;
	if (at <= first.offset) return first.color;
	if (at >= last.offset) return last.color;
	for (let index = 1; index < stops.length; index += 1) {
		const from = stops[index - 1];
		const to = stops[index];
		if (!from || !to || at > to.offset) continue;
		const span = to.offset - from.offset;
		if (span <= 1e-6) return to.color;
		return echarts.color.lerp((at - from.offset) / span, [from.color, to.color]) || from.color;
	}
	return last.color;
}

function windowedPaint(
	paint: Paint,
	axis: 'x' | 'y',
	edges: [number, number, number, number]
): Paint | null {
	const ownAxis = paintAxis(paint);
	if (ownAxis !== null && ownAxis !== axis) return null;
	const stops = paintStops(paint);
	const alphaAt = (offset: number) => {
		if (offset <= edges[0] || offset >= edges[3]) return 0;
		if (offset >= edges[1] && offset <= edges[2]) return 1;
		if (offset < edges[1]) return (offset - edges[0]) / Math.max(1e-6, edges[1] - edges[0]);
		return (edges[3] - offset) / Math.max(1e-6, edges[3] - edges[2]);
	};
	const offsets = [...new Set([0, 1, ...stops.map((stop) => stop.offset), ...edges])]
		.filter((offset) => offset >= 0 && offset <= 1)
		.sort((left, right) => left - right);
	const windowed = offsets.map((offset) => ({
		offset,
		color: withAlpha(sampleStops(stops, offset), alphaAt(offset))
	}));
	return axis === 'x'
		? new echarts.graphic.LinearGradient(0, 0, 1, 0, windowed)
		: new echarts.graphic.LinearGradient(0, 0, 0, 1, windowed);
}

function growPaint(paint: Paint, phase: number): Paint | null {
	const half = (INTRO_NODE_SCALE_FROM + (1 - INTRO_NODE_SCALE_FROM) * phase) / 2;
	return windowedPaint(paint, 'y', [
		0.5 - half - INTRO_FEATHER,
		0.5 - half,
		0.5 + half,
		0.5 + half + INTRO_FEATHER
	]);
}

function drawPaint(paint: Paint, phase: number): Paint | null {
	const head = phase * (1 + INTRO_FEATHER);
	return windowedPaint(paint, 'x', [-2, -1, head - INTRO_FEATHER, head]);
}

function connectedNodes(data: SankeyData, selected: string): Set<string> {
	const result = new Set([selected]);
	const selectedIndex = data.nodes.findIndex((node) => node.name === selected);
	for (const link of data.links) {
		if (link.source === selectedIndex) result.add(data.nodes[link.target]?.name ?? '');
		if (link.target === selectedIndex) result.add(data.nodes[link.source]?.name ?? '');
	}
	result.delete('');
	return result;
}

function nodeLabel(context: SankeyOptionContext): SankeySeriesOption['label'] {
	if (!context.label?.position) return { show: false };
	const inside = context.label.position === 'inside';
	const formatter = context.label.valueFormatter ?? ((value: number) => value.toLocaleString());
	return {
		show: true,
		position: inside ? 'inside' : 'right',
		align: inside ? 'center' : 'left',
		formatter: (params) => {
			const name = String((params as { name?: unknown }).name ?? '');
			const configured = context.config[name]?.label;
			const label = typeof configured === 'string' ? configured : name;
			return context.label?.showValues
				? `{name|${label}}\n{value|${formatter(context.nodeValues[name] ?? 0)}}`
				: `{name|${label}}`;
		},
		rich: {
			name: {
				color: context.resolved.tokens.foreground,
				fontSize: inside ? 10 : 12,
				fontWeight: 500,
				lineHeight: 15
			},
			value: {
				color: withAlpha(context.resolved.tokens.foreground, inside ? 0.6 : 0.5),
				fontFamily: 'monospace',
				fontSize: inside ? 11 : 12,
				lineHeight: 15
			}
		}
	};
}

function sankeySeries(context: SankeyOptionContext): SankeySeriesOption {
	const connected = context.selectedNode
		? connectedNodes(context.data, context.selectedNode)
		: null;
	const targetNames = new Set(
		context.data.links.map((link) => context.data.nodes[link.target]?.name)
	);
	const outside = context.label?.position === 'outside';
	const inside = context.label?.position === 'inside';
	const nodes: SankeyNodeItem[] = context.data.nodes.map((node) => {
		const phase = nodePhase(context.intro, node.name);
		const dimmed = Boolean(connected && !connected.has(node.name));
		const fill = nodeGradient(context.resolved.series[node.name] ?? [GRAY]);
		const grown = phase < 1 ? growPaint(fill, phase) : fill;
		return {
			name: node.name,
			itemStyle: inside
				? {
						color: withAlpha(context.resolved.tokens.background, 0.55 * phase),
						borderColor: grown ?? fill,
						borderWidth: 1,
						borderRadius: context.node.radius,
						opacity: (dimmed ? NODE_DIM_OPACITY : 1) * phase
					}
				: {
						color: grown ?? fill,
						borderWidth: 0,
						borderRadius: context.node.radius,
						opacity: (dimmed ? NODE_DIM_OPACITY : 1) * phase
					},
			label: {
				...(context.config[node.name]?.label === '' ? { show: false } : {}),
				opacity: (dimmed ? LABEL_DIM_OPACITY : 1) * phase,
				...(outside && !targetNames.has(node.name)
					? { position: 'left' as const, align: 'right' as const }
					: {})
			}
		};
	});
	const links: SankeyEdgeItem[] = context.data.links.map((link) => {
		const source = context.data.nodes[link.source]?.name ?? String(link.source);
		const target = context.data.nodes[link.target]?.name ?? String(link.target);
		const connectedLink =
			!context.selectedNode || source === context.selectedNode || target === context.selectedNode;
		const phase = linkPhase(context.intro, source);
		const paint = linkPaint(context, source, target);
		const drawn = phase < 1 ? drawPaint(paint, phase) : paint;
		return {
			source,
			target,
			value: link.value,
			lineStyle: {
				color: drawn ?? paint,
				opacity: (connectedLink ? LINK_FILL_OPACITY : LINK_DIM_OPACITY) * (drawn ? 1 : phase)
			}
		};
	});
	return {
		id: '__sankey',
		type: 'sankey',
		z: 3,
		left: outside ? 120 : 8,
		right: outside ? 120 : 8,
		top: 12,
		bottom: 12,
		nodeWidth: context.nodeWidth,
		nodeGap: context.nodePadding,
		layoutIterations: context.iterations,
		nodeAlign: context.align === 'left' ? 'left' : 'justify',
		draggable: false,
		emphasis: { focus: 'none' },
		lineStyle: { curveness: context.linkCurvature },
		label: nodeLabel(context),
		data: nodes,
		links
	};
}

function insidePlateSeries(context: SankeyOptionContext): SankeySeriesOption | null {
	if (context.label?.position !== 'inside') return null;
	const connected = context.selectedNode
		? connectedNodes(context.data, context.selectedNode)
		: null;
	const nodes: SankeyNodeItem[] = context.data.nodes.map((node) => {
		const phase = nodePhase(context.intro, node.name);
		const dimmed = Boolean(connected && !connected.has(node.name));
		const fill = nodeGradient(context.resolved.series[node.name] ?? [GRAY]);
		const grown = phase < 1 ? growPaint(fill, phase) : fill;
		return {
			name: node.name,
			itemStyle: {
				color: grown ?? fill,
				opacity: (dimmed ? NODE_DIM_OPACITY : 1) * phase,
				borderWidth: 0,
				borderRadius: context.node.radius
			},
			label: { show: false }
		};
	});
	const links: SankeyEdgeItem[] = context.data.links.map((link) => ({
		source: context.data.nodes[link.source]?.name ?? String(link.source),
		target: context.data.nodes[link.target]?.name ?? String(link.target),
		value: link.value,
		lineStyle: { opacity: 0 }
	}));
	return {
		id: '__sankey-plate',
		type: 'sankey',
		z: 2,
		silent: true,
		left: 8,
		right: 8,
		top: 12,
		bottom: 12,
		nodeWidth: context.nodeWidth,
		nodeGap: context.nodePadding,
		layoutIterations: context.iterations,
		nodeAlign: context.align === 'left' ? 'left' : 'justify',
		draggable: false,
		emphasis: { disabled: true },
		label: { show: false },
		lineStyle: { curveness: context.linkCurvature },
		data: nodes,
		links
	};
}

function tooltip(context: SankeyOptionContext): TooltipComponentOption {
	const slot = context.tooltip;
	const labelOf = (name: string) =>
		typeof context.config[name]?.label === 'string' ? (context.config[name].label as string) : name;
	const wrap = (body: string) =>
		`<div class="grid min-w-32 items-start gap-1.5 border border-border/50 px-2.5 py-1.5 text-xs shadow-xl ${roundnessClass[slot?.roundness ?? 'lg']} ${tooltipVariantClass[slot?.variant ?? 'default']}"><div class="grid gap-1.5">${body}</div></div>`;
	return {
		show: Boolean(slot) && !context.isLoading,
		trigger: 'item',
		confine: true,
		displayTransition: false,
		backgroundColor: 'transparent',
		borderWidth: 0,
		padding: 0,
		extraCssText: 'box-shadow:none;',
		position: resolveTooltipPosition(slot?.position ?? 'variable'),
		formatter: (params) => {
			const item = params as {
				dataType?: string;
				name?: string;
				data?: { source?: unknown; target?: unknown; value?: number };
			};
			if (item.dataType === 'edge') {
				const source = String(item.data?.source ?? '');
				const target = String(item.data?.target ?? '');
				return wrap(
					tooltipRow({
						indicatorHtml: tooltipIndicatorHtml(
							source,
							getColorsCount(context.config[source] ?? {})
						),
						labelText: `${labelOf(source)} → ${labelOf(target)}`,
						valueText: (item.data?.value ?? 0).toLocaleString(),
						dimmed: ''
					})
				);
			}
			const name = String(item.name ?? '');
			return wrap(
				tooltipRow({
					indicatorHtml: tooltipIndicatorHtml(name, getColorsCount(context.config[name] ?? {})),
					labelText: labelOf(name),
					valueText: (context.nodeValues[name] ?? 0).toLocaleString(),
					dimmed: ''
				})
			);
		}
	};
}

export function buildSankeyOption(context: SankeyOptionContext): EChartsSankeyOption {
	if (context.isLoading) {
		const transparent = withAlpha(context.resolved.tokens.foreground, 0);
		return {
			animation: false,
			tooltip: { show: false },
			series: [
				{
					id: '__loading',
					type: 'sankey',
					left: 12,
					right: 12,
					top: 12,
					bottom: 12,
					nodeWidth: DEFAULT_NODE_WIDTH,
					nodeGap: DEFAULT_NODE_PADDING,
					layoutIterations: DEFAULT_ITERATIONS,
					draggable: false,
					silent: true,
					emphasis: { disabled: true },
					label: { show: false },
					itemStyle: { color: transparent, borderWidth: 0 },
					lineStyle: { color: transparent, curveness: DEFAULT_LINK_CURVATURE },
					data: SKELETON_NODES,
					links: SKELETON_LINKS
				}
			]
		};
	}
	const main = sankeySeries(context);
	const plate = insidePlateSeries(context);
	return {
		animation: false,
		tooltip: tooltip(context),
		series: plate ? [plate, main] : [main]
	};
}

export function mergeSankeyChartOptions(
	built: EChartsSankeyOption,
	chartOptions?: Record<string, unknown>
): EChartsSankeyOption {
	const merged = chartOptions ? { ...built, ...chartOptions } : built;
	return Object.assign(merged, {
		animation: false,
		animationDurationUpdate: 0
	}) as EChartsSankeyOption;
}

export function sankeyShimmerStops(center: number, color: string, floor: number, peak: number) {
	const half = 0.22;
	const feather = 0.22;
	const alphaAt = (offset: number) => {
		const distance = Math.abs(offset - center);
		if (distance <= half - feather) return peak;
		if (distance >= half) return floor;
		const eased = Math.sin(((1 - (distance - (half - feather)) / feather) * Math.PI) / 2);
		return floor + (peak - floor) * eased;
	};
	return [
		0,
		center - half,
		center - half + feather,
		center,
		center + half - feather,
		center + half,
		1
	]
		.filter((offset) => offset >= 0 && offset <= 1)
		.sort((left, right) => left - right)
		.filter((offset, index, values) => index === 0 || offset - values[index - 1] > 1e-4)
		.map((offset) => ({ offset, color: withAlpha(color, alphaAt(offset)) }));
}
