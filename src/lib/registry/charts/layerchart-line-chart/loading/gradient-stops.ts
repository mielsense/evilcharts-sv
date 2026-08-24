// Builds bell-curve eased gradient stops for the loading shimmer
export const generateEasedGradientStops = (
	steps: number = 17,
	minOpacity: number = 0.05,
	maxOpacity: number = 0.9
) => {
	return Array.from({ length: steps }, (_, i) => {
		const t = i / (steps - 1); // 0 to 1
		// Sine-based bell curve easing: peaks at center (t=0.5), smooth falloff at edges
		const eased = Math.sin(t * Math.PI) ** 2;
		const opacity = minOpacity + eased * (maxOpacity - minOpacity);
		return { offset: `${(t * 100).toFixed(0)}%`, opacity: Number(opacity.toFixed(3)) };
	});
};
