// Format values to percent for expanded charts
export function axisValueToPercentFormatter(value: number) {
	return `${Math.round(value * 100).toFixed(0)}%`;
}
