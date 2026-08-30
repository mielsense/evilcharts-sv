import type * as echarts from 'echarts/core';

export type DotVariant = 'none' | 'default' | 'border' | 'colored-border' | 'ping';

export type DotItemStyleOption = {
	color?: string | echarts.graphic.LinearGradient;
	borderColor?: string | echarts.graphic.LinearGradient;
	borderWidth?: number;
	opacity?: number;
};

export type DotStyle = { size: number; itemStyle: DotItemStyleOption };

function colorWithAlpha(color: string, alpha: number): string {
	if (color.startsWith('#')) {
		let hex = color.slice(1);
		if (hex.length === 3) hex = hex.replace(/./g, (character) => character.repeat(2));
		const numeric = Number.parseInt(hex, 16);
		return `rgba(${(numeric >> 16) & 255}, ${(numeric >> 8) & 255}, ${numeric & 255}, ${alpha})`;
	}
	const match = color.match(/rgba?\(([^)]+)\)/);
	if (!match) return color;
	const [red, green, blue] = match[1].split(',').map((part) => Number.parseFloat(part));
	return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export function dotItemStyle(
	variant: DotVariant,
	paint: string | echarts.graphic.LinearGradient,
	background: string
): DotItemStyleOption {
	switch (variant) {
		case 'border':
			return { color: paint, borderColor: background, borderWidth: 2 };
		case 'colored-border':
			return { color: background, borderColor: paint, borderWidth: 1 };
		case 'ping':
			return {
				color: paint,
				borderColor: typeof paint === 'string' ? colorWithAlpha(paint, 0.28) : paint,
				borderWidth: 10
			};
		case 'default':
			return { color: paint, borderWidth: 0 };
		default:
			return {};
	}
}

export const DOT_SIZES: Record<DotVariant, number> = {
	none: 0,
	default: 6,
	border: 8,
	'colored-border': 6,
	ping: 8
};

export function dotStyle(
	variant: DotVariant,
	paint: string | echarts.graphic.LinearGradient,
	background: string
): DotStyle {
	return { size: DOT_SIZES[variant], itemStyle: dotItemStyle(variant, paint, background) };
}

export function sampleGradient(slots: string[], position: number): string {
	if (slots.length <= 1) return slots[0] ?? 'rgba(120, 120, 120, 1)';
	const parse = (color: string) =>
		color
			.match(/rgba?\(([^)]+)\)/)?.[1]
			.split(',')
			.map(Number) ?? [120, 120, 120, 1];
	const scaled = position * (slots.length - 1);
	const index = Math.min(Math.floor(scaled), slots.length - 2);
	const fraction = scaled - index;
	const [redFrom, greenFrom, blueFrom, alphaFrom = 1] = parse(slots[index]);
	const [redTo, greenTo, blueTo, alphaTo = 1] = parse(slots[index + 1]);
	const lerp = (from: number, to: number) => from + (to - from) * fraction;
	return `rgba(${Math.round(lerp(redFrom, redTo))}, ${Math.round(lerp(greenFrom, greenTo))}, ${Math.round(lerp(blueFrom, blueTo))}, ${lerp(alphaFrom, alphaTo).toFixed(3)})`;
}
