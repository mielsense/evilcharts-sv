---
title: Installation
description: Install EvilCharts and add charts to your project
image: /og/og-image.png
---

EvilCharts components are installed as source in a Svelte 5 project. Set up LayerChart and
shadcn-svelte once, then add only the charts you need.

## Steps

<Steps>
  <Step>
    <StepTitle>Install LayerChart</StepTitle>
    <StepContent>
      <StepDescription>

LayerChart powers every EvilCharts component and is a required dependency.

See the <Link href="https://www.layerchart.com/docs" _blank>LayerChart getting-started guide</Link>.

</StepDescription>
      <CommandBlock commands={["layerchart"]} />
    </StepContent>
  </Step>

  <Step>
    <StepTitle>Set up shadcn-svelte</StepTitle>
    <StepContent>
      <StepDescription>

Initialize shadcn-svelte to configure Tailwind CSS, themes, and the component structure. Skip this
step if your project already uses it.

See the <Link href="https://shadcn-svelte.com/docs/installation" _blank>shadcn-svelte installation guide</Link>.

</StepDescription>
      <CliBlock commands={["init"]} />
    </StepContent>
  </Step>

  <Step>
    <StepTitle>Add an EvilCharts component</StepTitle>
    <StepContent>
      <StepDescription>

Add a chart with the CLI. Replace `{chart-name}` with a registry name such as
`layerchart-area-chart`, `layerchart-bar-chart`, `layerchart-line-chart`, or
`layerchart-pie-chart`. The CLI installs the component source and its dependencies.

</StepDescription>
      <CliBlock commands={["https://evilcharts-sv.vercel.app/r/{chart-name}.json"]} />
    </StepContent>
  </Step>
</Steps>

After installation, give each chart root an accessible name. The shared `accessibility` prop accepts
a direct `label` or the ID of visible text through `labelledBy`. See
<Link href="/docs#accessibility">Accessibility</Link> for the complete example.

## Use with AI agents

Evil Charts for Svelte is available through Context7 MCP. Give your coding agent the exact library
ID <code>/mielsense/evilcharts-sv</code> so it reads this Svelte port instead of the original React
project.

```text
Use Context7 library /mielsense/evilcharts-sv for EvilCharts Svelte docs.
```

<Link href="https://context7.com/mielsense/evilcharts-sv" _blank>Open the Evil Charts for Svelte Context7 page</Link>.
