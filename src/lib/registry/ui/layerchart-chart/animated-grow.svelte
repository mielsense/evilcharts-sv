<script lang="ts">
	import type { Snippet } from 'svelte';

	type GrowAnimation = {
		initial: { scaleX: number } | { scaleY: number };
		animate: { scaleX: number } | { scaleY: number };
		transition: {
			duration: number;
			delay: number;
			ease: number[];
		};
		style: { originX: number } | { originY: number };
	};

	let { animation, children }: { animation: GrowAnimation; children: Snippet } = $props();

	function runGrow(value: GrowAnimation) {
		return (node: SVGGElement) => {
			node.style.transformBox = 'fill-box';
			const options: KeyframeAnimationOptions = {
				duration: value.transition.duration * 1000,
				delay: value.transition.delay * 1000,
				easing: `cubic-bezier(${value.transition.ease.join(',')})`,
				fill: 'both'
			};

			if ('scaleX' in value.initial) {
				const to = 'scaleX' in value.animate ? value.animate.scaleX : 1;
				node.style.transformOrigin = '0% 50%';
				const animation = node.animate(
					[{ transform: `scaleX(${value.initial.scaleX})` }, { transform: `scaleX(${to})` }],
					options
				);
				return () => animation.cancel();
			}

			const to = 'scaleY' in value.animate ? value.animate.scaleY : 1;
			node.style.transformOrigin = '50% 100%';
			const animation = node.animate(
				[{ transform: `scaleY(${value.initial.scaleY})` }, { transform: `scaleY(${to})` }],
				options
			);
			return () => animation.cancel();
		};
	}
</script>

<g {@attach runGrow(animation)}>
	{@render children()}
</g>
