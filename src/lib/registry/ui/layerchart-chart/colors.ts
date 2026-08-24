import { VALID_THEME_KEYS, type ChartConfig } from './chart-config.js';

// Distribute colors evenly across slots, extra slots go to last color(s)
// Example: 2 colors for 4 slots → [red, red, pink, pink]
// Example: 3 colors for 4 slots → [red, pink, blue, blue]
export function distributeColors(colorsArray: string[], maxCount: number): string[] {
	const availableCount = colorsArray.length;
	if (availableCount >= maxCount) {
		return colorsArray.slice(0, maxCount);
	}

	const result: string[] = [];
	const baseSlots = Math.floor(maxCount / availableCount);
	const extraSlots = maxCount % availableCount;

	// First (availableCount - extraSlots) colors get baseSlots each
	// Last extraSlots colors get (baseSlots + 1) each
	for (let colorIdx = 0; colorIdx < availableCount; colorIdx++) {
		const isExtraColor = colorIdx >= availableCount - extraSlots;
		const slotsForThisColor = baseSlots + (isExtraColor ? 1 : 0);
		for (let j = 0; j < slotsForThisColor; j++) {
			result.push(colorsArray[colorIdx]);
		}
	}

	return result;
}

// Get max colors count across all themes for a config entry
export function getColorsCount(config: ChartConfig[string]): number {
	if (!config.colors) return 1;
	const counts = VALID_THEME_KEYS.map((theme) => config.colors?.[theme]?.length ?? 0);
	return Math.max(...counts, 1);
}
