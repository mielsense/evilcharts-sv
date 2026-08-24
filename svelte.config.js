import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import { fileURLToPath } from 'node:url';
import { mdsvexCode } from './src/site/lib/mdsvex-code.ts';
import { mdsvexComponents } from './src/site/lib/mdsvex-components.ts';
import { mdsvexElements } from './src/site/lib/mdsvex-elements.ts';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.md'],
	/*
		Markdown is a first-class component format here, as it is in the reference's Fumadocs setup.
		Code fences go through Shiki with the ported transformers, so `[!code highlight]` notation
		behaves exactly as it does in the reference. See plans/DEVIATIONS.md D-1.
	*/
	preprocess: [
		// Before mdsvex: supplies each page with the component map Fumadocs would have injected.
		mdsvexComponents(),
		mdsvex({
			extensions: ['.md'],
			/*
				An absolute path: mdsvex reads the layout off disk while preprocessing and then emits
				the same string as an import, so a bare `src/…` path fails to resolve and an alias
				fails the `fs` read.
			*/
			layout: fileURLToPath(
				new URL('./src/site/components/docs/mdx/layout.svelte', import.meta.url)
			),
			// Fences are handled by the remark plugin below, which needs the fence's `meta` too.
			highlight: false,
			remarkPlugins: [mdsvexCode],
			// The reference's HTML element overrides, which mdsvex cannot express as components.
			// The attacher itself, not its result: unified calls it and takes the transformer back.
			rehypePlugins: [mdsvexElements]
		}),
		vitePreprocess()
	],
	kit: {
		/*
			Pinned rather than `adapter-auto`, which resolves an adapter at build time on the host. Landing
			and machine-readable assets are prerendered; docs and `/mcp` remain dynamic.
		*/
		adapter: adapter({
			// Pinned explicitly: the adapter otherwise derives the runtime from the *building* machine's
			// Node version, which need not be one Vercel offers.
			runtime: 'nodejs22.x'
		}),
		alias: {
			$site: 'src/site',
			$content: 'content'
		}
	}
};

export default config;
