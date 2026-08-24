<script lang="ts">
	/** `FeedbackButtons` from `evilcharts/src/components/docs/mdx/components/feedback-buttons.tsx`. */
	import { ThumbsDownIcon, ThumbsUpIcon } from '$site/assets/icons/index.js';
	import { Button } from '$site/components/ui/button/index.js';

	let feedback = $state<'good' | 'bad' | null>(null);

	const selected = 'text-primary border-primary/50 dark:border-primary/50';
	const unselected = 'text-muted-foreground dark:text-muted-foreground/80 hover:text-primary';
</script>

<div class="flex flex-wrap items-center gap-3">
	<span class="text-sm text-muted-foreground">Was this page helpful?</span>
	<div class="space-x-2">
		<Button
			class={feedback === 'good' ? selected : unselected}
			variant="outline"
			size="sm"
			onclick={() => (feedback = 'good')}
		>
			<ThumbsUpIcon />
			<span>Yes</span>
		</Button>
		<Button
			class={feedback === 'bad' ? selected : unselected}
			variant="outline"
			size="sm"
			onclick={() => (feedback = 'bad')}
		>
			<ThumbsDownIcon />
			<span>No</span>
		</Button>
	</div>
</div>
