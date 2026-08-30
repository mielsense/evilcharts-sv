import type { DataZoomComponentOption } from 'echarts/components';
import type { EChartsType } from 'echarts/core';
import * as echarts from 'echarts/core';
import { withAlpha, type ResolvedColors } from '../echarts-chart/index.js';

export const BRUSH_BORDER_OPACITY = 1;

export type BrushRange = { start: number; end: number };
export type BrushGeometry = { bottom: number; height: number };

export type BrushOverlayParams = {
	range: BrushRange;
	geom: BrushGeometry;
	size: { width: number; height: number };
	tokens: ResolvedColors['tokens'];
	labels: { start: string; end: string } | null;
	showLabels: boolean;
	hover: { left: boolean; right: boolean };
};

type ZrRect = InstanceType<typeof echarts.graphic.Rect>;
type ZrCircle = InstanceType<typeof echarts.graphic.Circle>;
type ZrText = InstanceType<typeof echarts.graphic.Text>;

export type BrushOverlayElements = {
	dimLeft: ZrRect;
	dimRight: ZrRect;
	frame: ZrRect;
	pillLeft: ZrRect;
	pillRight: ZrRect;
	grips: ZrCircle[];
	labelStart: ZrText;
	labelEnd: ZrText;
};

export function syncBrushOverlay(
	chart: EChartsType,
	store: { brushOverlay: BrushOverlayElements | null },
	params: BrushOverlayParams | null
): void {
	const renderer = chart.getZr();
	if (!renderer) return;

	if (!params) {
		if (store.brushOverlay) {
			const { grips, ...rest } = store.brushOverlay;
			for (const element of [...Object.values(rest), ...grips]) renderer.remove(element);
			store.brushOverlay = null;
		}
		return;
	}

	if (!store.brushOverlay) {
		const rect = (z: number) => new echarts.graphic.Rect({ silent: true, z, shape: {} });
		const elements: BrushOverlayElements = {
			dimLeft: rect(100),
			dimRight: rect(100),
			frame: rect(101),
			pillLeft: rect(102),
			pillRight: rect(102),
			grips: Array.from(
				{ length: 6 },
				() => new echarts.graphic.Circle({ silent: true, z: 103, shape: {} })
			),
			labelStart: new echarts.graphic.Text({ silent: true, z: 104 }),
			labelEnd: new echarts.graphic.Text({ silent: true, z: 104 })
		};
		const { grips, ...rest } = elements;
		for (const element of [...Object.values(rest), ...grips]) renderer.add(element);
		store.brushOverlay = elements;
	}

	const elements = store.brushOverlay;
	const { range, geom, size, tokens, labels, showLabels, hover } = params;
	const trackLeft = 8;
	const trackRight = Math.max(size.width - 8, trackLeft);
	const trackWidth = trackRight - trackLeft;
	const top = size.height - geom.bottom - geom.height;
	const centerY = top + geom.height / 2;
	const selectionLeft = trackLeft + (trackWidth * range.start) / 100;
	const selectionRight = trackLeft + (trackWidth * range.end) / 100;

	const dimFill = withAlpha(tokens.background, 0.7);
	elements.dimLeft.setShape({
		x: trackLeft,
		y: top,
		width: Math.max(selectionLeft - trackLeft, 0),
		height: geom.height
	});
	elements.dimLeft.setStyle({ fill: dimFill });
	elements.dimRight.setShape({
		x: selectionRight,
		y: top,
		width: Math.max(trackRight - selectionRight, 0),
		height: geom.height
	});
	elements.dimRight.setStyle({ fill: dimFill });
	elements.frame.setShape({
		x: selectionLeft,
		y: top,
		width: Math.max(selectionRight - selectionLeft, 0),
		height: geom.height,
		r: 6
	});
	elements.frame.setStyle({
		fill: 'none',
		stroke: withAlpha(tokens.border, BRUSH_BORDER_OPACITY),
		lineWidth: 1
	});

	const updatePill = (element: ZrRect, x: number, hovered: boolean) => {
		element.setShape({ x: x - 3, y: centerY - 8, width: 6, height: 16, r: 3 });
		element.setStyle({ fill: hovered ? tokens.foreground : tokens.mutedForeground });
	};
	updatePill(elements.pillLeft, selectionLeft, hover.left);
	updatePill(elements.pillRight, selectionRight, hover.right);

	const gripFill = withAlpha(tokens.background, 0.7);
	for (const [index, offset] of [-4, 0, 4].entries()) {
		elements.grips[index].setShape({ cx: selectionLeft, cy: centerY + offset, r: 1 });
		elements.grips[index].setStyle({ fill: gripFill });
		elements.grips[index + 3].setShape({ cx: selectionRight, cy: centerY + offset, r: 1 });
		elements.grips[index + 3].setStyle({ fill: gripFill });
	}

	const updateLabel = (element: ZrText, text: string, x: number, align: 'left' | 'right') => {
		element.setStyle({
			text,
			x: align === 'left' ? Math.max(x + 6, trackLeft + 2) : Math.min(x - 6, trackRight - 2),
			y: top + geom.height,
			align,
			verticalAlign: 'middle',
			fill: tokens.background,
			backgroundColor: tokens.foreground,
			padding: [2, 5],
			borderRadius: 4,
			font: '500 9px system-ui, sans-serif'
		});
		element.attr('invisible', !showLabels || !text);
	};
	updateLabel(elements.labelStart, labels?.start ?? '', selectionLeft, 'left');
	updateLabel(elements.labelEnd, labels?.end ?? '', selectionRight, 'right');
}

export function buildBrushDataZoom(params: {
	brushBottom: number;
	brushHeight: number;
	brushRange: BrushRange;
	fillerColor: string;
}): DataZoomComponentOption[] {
	const { brushBottom, brushHeight, brushRange, fillerColor } = params;
	return [
		{
			type: 'slider',
			show: true,
			xAxisIndex: [0],
			left: 8,
			right: 8,
			bottom: brushBottom,
			height: brushHeight,
			start: brushRange.start,
			end: brushRange.end,
			brushSelect: false,
			showDetail: false,
			backgroundColor: 'transparent',
			borderColor: 'transparent',
			fillerColor,
			dataBackground: { lineStyle: { opacity: 0 }, areaStyle: { opacity: 0 } },
			selectedDataBackground: { lineStyle: { opacity: 0 }, areaStyle: { opacity: 0 } },
			handleIcon:
				'path://M -3 -5 L -3 5 A 3 3 0 0 0 3 5 L 3 -5 A 3 3 0 0 0 -3 -5 Z',
			handleSize: '35%',
			handleStyle: { opacity: 0 },
			moveHandleSize: 0,
			emphasis: { handleStyle: { opacity: 0 } }
		},
		{ type: 'inside', xAxisIndex: [0] }
	];
}

