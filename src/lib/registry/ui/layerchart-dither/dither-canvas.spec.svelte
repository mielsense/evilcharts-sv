<script lang="ts">
	import DitherCanvas from './dither-canvas.svelte';
	import {
		paintDitherArc,
		paintDitherPolygon,
		paintDitherRect,
		paintDitherStroke
	} from './paint.js';
	import type { DitherCanvasFrame } from './types.js';

	type Props = {
		animate?: boolean;
		animationDuration?: number;
		reducedMotion?: boolean;
		shapes?: boolean;
	};

	let { animate = false, animationDuration = 48, reducedMotion, shapes = false }: Props = $props();
	let width = $state(64);
	let dataRevision = $state(0);
	let selectionRevision = $state(0);
	let hoverRevision = $state(0);
	let animationRevision = $state(0);
	let paintCount = $state(0);
	let lastProgress = $state(0);
	let lastReasons = $state('');
	let lastColor = $state('');
	let animationFrames = $state(0);

	function paint(frame: DitherCanvasFrame) {
		paintCount += 1;
		lastProgress = frame.progress;
		lastReasons = [...frame.reasons].sort().join(',');
		if (frame.reasons.has('animation')) animationFrames += 1;
		lastColor = frame.resolveColor('var(--dither-test-color)') ?? '';
		if (!shapes) {
			frame.context.fillStyle = lastColor;
			frame.context.fillRect(0, 0, frame.width, frame.height);
			return;
		}

		paintDitherRect(
			frame.context,
			{ x: 0, y: 0, width: 12, height: 12 },
			{
				color: 'rgb(255 0 0)',
				coverage: 1
			}
		);
		paintDitherPolygon(
			frame.context,
			[
				[16, 0],
				[28, 0],
				[16, 12]
			],
			{
				color: 'rgb(0 255 0)',
				coverage: 1
			}
		);
		paintDitherArc(
			frame.context,
			{ centerX: 40, centerY: 6, outerRadius: 6, startAngle: 0, endAngle: Math.PI * 2 },
			{ color: 'rgb(0 0 255)', coverage: 1 }
		);
		const stroke = new Path2D();
		stroke.moveTo(48, 6);
		stroke.lineTo(62, 6);
		paintDitherStroke(frame.context, stroke, { color: 'rgb(255 255 0)', lineWidth: 2 });
	}
</script>

<div
	data-testid="dither-host"
	style:width="{width}px"
	style="height: 32px; position: relative; --dither-test-color: rgb(255 62 0);"
>
	<DitherCanvas
		{paint}
		{animate}
		{animationDuration}
		{dataRevision}
		{selectionRevision}
		{hoverRevision}
		{animationRevision}
		{reducedMotion}
		pixelRatio={2}
	/>
</div>

<output data-testid="paint-state"
	>{paintCount}|{lastProgress}|{lastReasons}|{lastColor}|{animationFrames}</output
>
<button data-testid="data" onclick={() => (dataRevision += 1)}>data</button>
<button data-testid="selection" onclick={() => (selectionRevision += 1)}>selection</button>
<button data-testid="hover" onclick={() => (hoverRevision += 1)}>hover</button>
<button data-testid="replay" onclick={() => (animationRevision += 1)}>replay</button>
<button data-testid="resize" onclick={() => (width = 96)}>resize</button>
