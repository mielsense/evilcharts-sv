<script lang="ts">
	import { page } from '$app/state';
	import { Alert02Icon, BookOpen02Icon, RefreshIcon } from '@hugeicons/core-free-icons';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { Button } from '$site/components/ui/button/index.js';
	import { PORT_ISSUES_URL, SITE_NAME } from '$site/globals/constants/site.js';

	const isNotFound = $derived(page.status === 404);
	const title = $derived(isNotFound ? 'This docs page doesn’t exist.' : 'The docs hit an error.');
	const description = $derived(
		isNotFound
			? 'The link may be outdated, or the page may have moved.'
			: 'Try loading the page again. If the problem continues, report it with the status code below.'
	);

	function retry() {
		window.location.reload();
	}
</script>

<svelte:head>
	<title>{page.status} — {SITE_NAME}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main class="mx-auto grid min-h-[calc(100svh-8rem)] w-full max-w-3xl place-items-center px-6 py-16">
	<section class="flex max-w-lg flex-col items-center text-center" aria-labelledby="error-title">
		<div class="mb-6 grid size-12 place-items-center rounded-xl border bg-muted/30 text-svelte">
			<HugeiconsIcon icon={Alert02Icon} strokeWidth={1.5} aria-hidden="true" class="size-6" />
		</div>

		<p class="font-mono text-xs font-medium tracking-[0.16em] text-svelte uppercase">
			Error {page.status}
		</p>
		<h1
			id="error-title"
			class="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
		>
			{title}
		</h1>
		<p class="mt-4 max-w-md text-sm leading-6 text-pretty text-muted-foreground sm:text-base">
			{description}
		</p>

		<div class="mt-7 flex flex-wrap items-center justify-center gap-2">
			{#if !isNotFound}
				<Button onclick={retry}>
					<HugeiconsIcon icon={RefreshIcon} aria-hidden="true" />
					Try again
				</Button>
			{/if}
			<Button href="/docs" variant={isNotFound ? 'default' : 'outline'}>
				<HugeiconsIcon icon={BookOpen02Icon} aria-hidden="true" />
				Browse documentation
			</Button>
		</div>

		<!-- eslint-disable svelte/no-navigation-without-resolve -- Absolute external URL. -->
		{#if !isNotFound}
			<a
				href={PORT_ISSUES_URL}
				class="mt-5 text-sm text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-foreground"
			>
				Report the problem
			</a>
		{/if}
	</section>
</main>
