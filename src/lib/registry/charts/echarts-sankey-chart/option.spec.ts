import { describe, expect, it } from 'vitest';
import type * as echarts from 'echarts/core';
import {
	buildSankeyOption,
	computeNodeDepths,
	computeNodeValues,
	getSankeyRevealDecision,
	mergeSankeyChartOptions
} from './option.js';

function asArray<T>(value: T | T[] | undefined): T[] {
	return value === undefined ? [] : Array.isArray(value) ? value : [value];
}

const data = {
	nodes: [{ name: 'source' }, { name: 'middle' }, { name: 'leaf' }],
	links: [
		{ source: 0, target: 1, value: 8 },
		{ source: 1, target: 2, value: 6 }
	]
};
const resolved = {
	series: { source: ['#ff0000'], middle: ['#00ff00'], leaf: ['#0000ff'] },
	tokens: {
		mutedForeground: 'rgba(120, 120, 120, 1)',
		border: 'rgba(120, 120, 120, 0.35)',
		foreground: 'rgba(20, 20, 20, 1)',
		background: 'rgba(255, 255, 255, 1)'
	}
};

describe('buildSankeyOption', () => {
	it('keeps layout geometry stable while interpolating intro paint', () => {
		const option = buildSankeyOption({
			data,
			config: {},
			node: { radius: 4, isClickable: true },
			label: { position: 'outside', showValues: true },
			link: { variant: 'gradient', verticalPadding: 0 },
			tooltip: undefined,
			selectedNode: null,
			nodeWidth: 10,
			nodePadding: 10,
			linkCurvature: 0.5,
			iterations: 32,
			align: 'justify',
			isLoading: false,
			resolved,
			nodeValues: computeNodeValues(data),
			intro: { elapsed: 100, depths: computeNodeDepths(data) }
		});

		expect(option.animation).toBe(false);
		expect(option.aria).toBeUndefined();
		const series = asArray(option.series);
		expect(series).toHaveLength(1);
		expect(series[0]).toMatchObject({ type: 'sankey', left: 120, right: 120, draggable: false });
		expect(asArray(series[0]?.data)).toHaveLength(3);
		expect(asArray(series[0]?.links)).toHaveLength(2);
		const source = asArray(series[0]?.data)[0];
		const sourcePaint = source?.itemStyle?.color as echarts.graphic.LinearGradient;
		expect(sourcePaint).toMatchObject({ type: 'linear', x: 0, y: 0, x2: 0, y2: 1 });
		expect(sourcePaint.colorStops.length).toBeGreaterThan(2);

		const firstLink = asArray(series[0]?.links)[0];
		const linkPaint = firstLink?.lineStyle?.color as echarts.graphic.LinearGradient;
		expect(linkPaint).toMatchObject({ type: 'linear', x: 0, y: 0, x2: 1, y2: 0 });
		expect(linkPaint.colorStops.length).toBeGreaterThan(3);
	});

	it('dims nodes beyond the selected node direct neighborhood', () => {
		const extended = {
			nodes: [...data.nodes, { name: 'remote' }],
			links: [...data.links, { source: 2, target: 3, value: 4 }]
		};
		const option = buildSankeyOption({
			data: extended,
			config: {},
			node: { radius: 0, isClickable: true },
			label: null,
			link: { variant: 'source', verticalPadding: 0 },
			tooltip: undefined,
			selectedNode: 'source',
			nodeWidth: 10,
			nodePadding: 10,
			linkCurvature: 0.5,
			iterations: 32,
			align: 'justify',
			isLoading: false,
			resolved: { ...resolved, series: { ...resolved.series, remote: ['#ffffff'] } },
			nodeValues: computeNodeValues(extended),
			intro: null
		});

		const series = asArray(option.series);
		expect(asArray(series[0]?.data)[2]).toMatchObject({ itemStyle: { opacity: 0.3 } });
		expect(asArray(series[0]?.links)[1]).toMatchObject({ lineStyle: { opacity: 0.05 } });
	});

	it('layers colored nodes beneath the translucent inside-label plates', () => {
		const option = buildSankeyOption({
			data,
			config: {},
			node: { radius: 4, isClickable: false },
			label: { position: 'inside', showValues: true },
			link: { variant: 'gradient', verticalPadding: 0 },
			tooltip: undefined,
			selectedNode: null,
			nodeWidth: 80,
			nodePadding: 24,
			linkCurvature: 0.5,
			iterations: 32,
			align: 'justify',
			isLoading: false,
			resolved,
			nodeValues: computeNodeValues(data),
			intro: null
		});

		expect(asArray(option.series).map((series) => series.id)).toEqual([
			'__sankey-plate',
			'__sankey'
		]);
	});

	it('uses outgoing flow, falling back to incoming flow for leaf nodes', () => {
		expect(computeNodeValues(data)).toEqual({ source: 8, middle: 6, leaf: 6 });
		expect(computeNodeDepths(data)).toEqual({ source: 0, middle: 1, leaf: 2 });
	});

	it('builds a silent loading graph without tooltips', () => {
		const option = buildSankeyOption({
			data,
			config: {},
			node: { radius: 0, isClickable: false },
			label: null,
			link: { variant: 'gradient', verticalPadding: 0 },
			tooltip: undefined,
			selectedNode: null,
			nodeWidth: 10,
			nodePadding: 10,
			linkCurvature: 0.5,
			iterations: 32,
			align: 'justify',
			isLoading: true,
			resolved,
			nodeValues: computeNodeValues(data),
			intro: null
		});

		expect(option.tooltip).toEqual({ show: false });
		expect(asArray(option.series)[0]).toMatchObject({
			id: '__loading',
			silent: true,
			label: { show: false }
		});
	});
});

describe('getSankeyRevealDecision', () => {
	it('consumes the first real render even when animation is disabled', () => {
		expect(
			getSankeyRevealDecision({
				hasRevealed: false,
				isLoading: false,
				animation: false,
				animationType: 'default',
				reducedMotion: false
			})
		).toEqual({ hasRevealed: true, shouldReveal: false });
	});

	it('re-arms after loading and respects reduced motion', () => {
		expect(
			getSankeyRevealDecision({
				hasRevealed: true,
				isLoading: true,
				animation: true,
				animationType: 'default',
				reducedMotion: false
			})
		).toEqual({ hasRevealed: false, shouldReveal: false });
		expect(
			getSankeyRevealDecision({
				hasRevealed: false,
				isLoading: false,
				animation: true,
				animationType: 'default',
				reducedMotion: true
			})
		).toEqual({ hasRevealed: true, shouldReveal: false });
	});
});

describe('mergeSankeyChartOptions', () => {
	it('keeps native ECharts animation disabled after escape-hatch options merge', () => {
		expect(
			mergeSankeyChartOptions(
				{ animation: false, animationDurationUpdate: 0 },
				{ animation: true, animationDurationUpdate: 400, darkMode: true }
			)
		).toMatchObject({ animation: false, animationDurationUpdate: 0, darkMode: true });
	});
});
