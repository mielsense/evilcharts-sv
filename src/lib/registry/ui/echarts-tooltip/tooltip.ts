import type { TooltipComponentOption } from 'echarts/components';
import { indicatorBackground } from '../echarts-chart/index.js';

export type TooltipVariant = 'default' | 'frosted-glass';
export type TooltipRoundness = 'sm' | 'md' | 'lg' | 'xl';
export type TooltipPosition = 'fixed' | 'variable';

export const roundnessClass: Record<TooltipRoundness, string> = {
	sm: 'rounded-sm',
	md: 'rounded-md',
	lg: 'rounded-lg',
	xl: 'rounded-xl'
};

export const tooltipVariantClass: Record<TooltipVariant, string> = {
	default: 'bg-background',
	'frosted-glass': 'bg-background/50 backdrop-blur-md'
};

export function escapeTooltipHtml(value: unknown): string {
	return String(value ?? '')
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#039;');
}

export function tooltipIndicatorHtml(key: string, colorsCount: number): string {
	return `<div class="h-2.5 w-2.5 shrink-0 rounded-[2px]" style="background:${indicatorBackground(key, colorsCount)}"></div>`;
}

export function tooltipRow({
	indicatorHtml,
	labelText,
	valueText,
	dimmed
}: {
	indicatorHtml: string;
	labelText: string;
	valueText: string;
	dimmed: string;
}): string {
	return `<div class="flex w-full flex-wrap items-center gap-2${dimmed}">
          ${indicatorHtml}
          <div class="flex flex-1 items-center justify-between gap-4 leading-none">
            <span class="text-muted-foreground">${escapeTooltipHtml(labelText)}</span>
            <span class="text-foreground font-mono font-medium tabular-nums">${escapeTooltipHtml(valueText)}</span>
          </div>
        </div>`;
}

export function tooltipShell({
	label,
	body,
	roundness,
	variant
}: {
	label: string;
	body: string;
	roundness: TooltipRoundness;
	variant: TooltipVariant;
}): string {
	return `<div class="grid min-w-32 items-start gap-1.5 border border-border/50 px-2.5 py-1.5 text-xs shadow-xl ${roundnessClass[roundness]} ${tooltipVariantClass[variant]}">
      <div class="font-medium text-primary">${escapeTooltipHtml(label)}</div>
      <div class="grid gap-1.5">${body}</div>
    </div>`;
}

export function resolveTooltipPosition(
	position: TooltipPosition
): TooltipComponentOption['position'] {
	if (position === 'variable') return undefined;
	return (point, _params, _dom, _rect, size) => [point[0] - size.contentSize[0] / 2, 8];
}

export function tooltipBaseOption(params: {
	present: boolean;
	cursor: boolean;
	position: TooltipPosition;
	axisPointerColor: string;
	strokeWidth: number;
}): TooltipComponentOption {
	const { present, cursor, position, axisPointerColor, strokeWidth } = params;
	return {
		show: present,
		trigger: 'axis',
		confine: true,
		displayTransition: false,
		backgroundColor: 'transparent',
		borderWidth: 0,
		padding: 0,
		extraCssText: 'box-shadow:none;',
		axisPointer: cursor
			? {
					type: 'line',
					lineStyle: { color: axisPointerColor, width: strokeWidth, type: [3, 3] }
				}
			: { type: 'none' },
		position: resolveTooltipPosition(position)
	};
}
