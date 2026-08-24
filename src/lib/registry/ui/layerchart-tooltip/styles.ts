import { getColorsCount } from '../layerchart-chart/colors.js';
import type { ChartConfig } from '../layerchart-chart/chart-config.js';
import type { TooltipRoundness, TooltipVariant } from './types.js';

export const roundnessMap: Record<TooltipRoundness, string> = {
	sm: 'rounded-sm',
	md: 'rounded-md',
	lg: 'rounded-lg',
	xl: 'rounded-xl'
};

export const variantMap: Record<TooltipVariant, string> = {
	default: 'bg-background',
	'frosted-glass': 'bg-background/70 backdrop-blur-sm'
};

export function getIndicatorColorStyle(dataKey: string, colorsCount: number): string {
	if (colorsCount <= 1) {
		return `background: var(--color-${dataKey}-0)`;
	}

	// Multiple colors: create linear gradient with evenly distributed stops
	const stops = Array.from({ length: colorsCount }, (_, index) => {
		const offset = (index / (colorsCount - 1)) * 100;
		return `var(--color-${dataKey}-${index}) ${offset}%`;
	}).join(', ');

	return `background: linear-gradient(to right, ${stops})`;
}

export function colorsCountFor(itemConfig: ChartConfig[string] | undefined): number {
	return itemConfig ? getColorsCount(itemConfig) : 1;
}
