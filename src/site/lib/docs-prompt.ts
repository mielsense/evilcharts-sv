export function buildDocsPrompt(url: string) {
	return `I'm reading this EvilCharts page: ${url}
Use it to explain the relevant concepts and examples. Help me debug my code if I share it.`;
}
