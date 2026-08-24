export type SourceFileMeta = {
	path: string;
	target?: string;
	language: string;
	url: string;
};

export type SourceFile = Omit<SourceFileMeta, 'url'> & {
	code: string;
	html: string;
};

export type SourceMetadata = {
	name: string;
	files: SourceFileMeta[];
};

const metadataCache = new Map<string, Promise<SourceMetadata>>();
const fileCache = new Map<string, Promise<SourceFile>>();

function cached<T>(
	cache: Map<string, Promise<T>>,
	key: string,
	load: () => Promise<T>
): Promise<T> {
	const existing = cache.get(key);
	if (existing) return existing;

	const pending = load().catch((error) => {
		if (cache.get(key) === pending) cache.delete(key);
		throw error;
	});
	cache.set(key, pending);
	return pending;
}

async function fetchJson<T>(fetcher: typeof fetch, url: string): Promise<T> {
	const response = await fetcher(url);
	if (!response.ok) throw new Error(`Source request failed with ${response.status}`);
	return response.json() as Promise<T>;
}

export function loadSourceMetadata(name: string, fetcher: typeof fetch = fetch) {
	const url = `/api/source/${encodeURIComponent(name)}`;
	return cached(metadataCache, url, () => fetchJson<SourceMetadata>(fetcher, url));
}

export function loadSourceFile(url: string, fetcher: typeof fetch = fetch) {
	return cached(fileCache, url, () => fetchJson<SourceFile>(fetcher, url));
}
