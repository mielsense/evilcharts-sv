<script lang="ts">
	type BrushRange = { startIndex: number; endIndex: number };
	type BrushControl = 'range' | 'start' | 'end';

	let {
		startIndex,
		endIndex,
		totalPoints,
		formatLabel = (index: number) => String(index),
		onChange
	}: {
		startIndex: number;
		endIndex: number;
		totalPoints: number;
		formatLabel?: (index: number) => string;
		onChange: (range: BrushRange) => void;
	} = $props();

	const maximum = $derived(Math.max(0, totalPoints - 1));
	const minimumSpan = $derived(totalPoints > 1 ? 1 : 0);
	const windowSize = $derived(Math.max(0, endIndex - startIndex));
	const maximumWindowStart = $derived(Math.max(0, maximum - windowSize));

	function commit(next: BrushRange) {
		const start = Math.max(0, Math.min(next.startIndex, maximum));
		const end = Math.max(start, Math.min(next.endIndex, maximum));
		if (start === startIndex && end === endIndex) return;
		onChange({ startIndex: start, endIndex: end });
	}

	function handleKey(event: KeyboardEvent, control: BrushControl) {
		if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
		event.preventDefault();

		if (control === 'range') {
			const delta =
				event.key === 'ArrowLeft'
					? -1
					: event.key === 'ArrowRight'
						? 1
						: event.key === 'Home'
							? -startIndex
							: maximum - endIndex;
			const nextStart = Math.max(0, Math.min(startIndex + delta, maximumWindowStart));
			commit({ startIndex: nextStart, endIndex: nextStart + windowSize });
			return;
		}

		if (control === 'start') {
			const nextStart =
				event.key === 'Home'
					? 0
					: event.key === 'End'
						? endIndex - minimumSpan
						: startIndex + (event.key === 'ArrowLeft' ? -1 : 1);
			commit({ startIndex: Math.min(nextStart, endIndex - minimumSpan), endIndex });
			return;
		}

		const nextEnd =
			event.key === 'Home'
				? startIndex + minimumSpan
				: event.key === 'End'
					? maximum
					: endIndex + (event.key === 'ArrowLeft' ? -1 : 1);
		commit({ startIndex, endIndex: Math.max(nextEnd, startIndex + minimumSpan) });
	}
</script>

{#if totalPoints > 0}
	<div
		class="pointer-events-none absolute inset-0 z-50"
		role="group"
		aria-label="Chart range controls"
	>
		<div
			role="slider"
			tabindex="0"
			class="sr-only focus:pointer-events-auto focus:not-sr-only focus:absolute focus:bottom-2 focus:left-1/2 focus:-translate-x-1/2 focus:rounded-md focus:border focus:bg-background focus:px-3 focus:py-2 focus:text-foreground focus:shadow-md focus:ring-2 focus:ring-ring focus:outline-none"
			aria-label="Selected chart range"
			aria-orientation="horizontal"
			aria-valuemin="0"
			aria-valuemax={maximumWindowStart}
			aria-valuenow={startIndex}
			aria-valuetext={`${formatLabel(startIndex)} to ${formatLabel(endIndex)}`}
			onkeydown={(event) => handleKey(event, 'range')}
		>
			Selected range: {formatLabel(startIndex)} to {formatLabel(endIndex)}
		</div>
		<div
			role="slider"
			tabindex="0"
			class="sr-only focus:pointer-events-auto focus:not-sr-only focus:absolute focus:bottom-2 focus:left-1/2 focus:-translate-x-1/2 focus:rounded-md focus:border focus:bg-background focus:px-3 focus:py-2 focus:text-foreground focus:shadow-md focus:ring-2 focus:ring-ring focus:outline-none"
			aria-label="Range start"
			aria-orientation="horizontal"
			aria-valuemin="0"
			aria-valuemax={Math.max(0, endIndex - minimumSpan)}
			aria-valuenow={startIndex}
			aria-valuetext={formatLabel(startIndex)}
			onkeydown={(event) => handleKey(event, 'start')}
		>
			Range start: {formatLabel(startIndex)}
		</div>
		<div
			role="slider"
			tabindex="0"
			class="sr-only focus:pointer-events-auto focus:not-sr-only focus:absolute focus:bottom-2 focus:left-1/2 focus:-translate-x-1/2 focus:rounded-md focus:border focus:bg-background focus:px-3 focus:py-2 focus:text-foreground focus:shadow-md focus:ring-2 focus:ring-ring focus:outline-none"
			aria-label="Range end"
			aria-orientation="horizontal"
			aria-valuemin={Math.min(maximum, startIndex + minimumSpan)}
			aria-valuemax={maximum}
			aria-valuenow={endIndex}
			aria-valuetext={formatLabel(endIndex)}
			onkeydown={(event) => handleKey(event, 'end')}
		>
			Range end: {formatLabel(endIndex)}
		</div>
	</div>
{/if}
