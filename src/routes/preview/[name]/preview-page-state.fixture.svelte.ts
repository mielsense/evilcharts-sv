import { SvelteURL } from 'svelte/reactivity';

export const routePage = $state({
	params: { name: 'preview-route-ready-test' },
	url: new SvelteURL('http://localhost/preview/preview-route-ready-test')
});

export function setRouteName(name: string) {
	routePage.params.name = name;
	routePage.url = new SvelteURL(`http://localhost/preview/${name}`);
}
