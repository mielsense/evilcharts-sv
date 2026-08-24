---
title: Installation
description: Install EvilCharts and add charts to your project
image: /og/og-image.png
---

EvilCharts is plug-and-play. Skip the heavy setup—follow these steps to add beautiful, interactive charts to your Next.js project.

## Steps

<Steps>
  <Step>
    <StepTitle>Install LayerChart</StepTitle>
    <StepContent>
      <StepDescription>

LayerChart powers every EvilCharts component and is a required dependency.

See the <Link href="https://layerchart.github.io/en-US/guide/installation" _blank>LayerChart installation guide</Link>.

</StepDescription>
      <CommandBlock commands={["layerchart"]} />
    </StepContent>
  </Step>

  <Step>
    <StepTitle>Setup shadcn/ui</StepTitle>
    <StepContent>
      <StepDescription>

Initialize shadcn/ui to set up Tailwind CSS, themes, and component structure. Skip this if it's already installed.

See the <Link href="https://ui.shadcn.com/docs/installation/next" _blank>shadcn/ui Next.js installation docs</Link>.

</StepDescription>
      <CliBlock commands={["init"]} />
    </StepContent>
  </Step>

  <Step>
    <StepTitle>Add EvilCharts Components</StepTitle>
    <StepContent>
      <StepDescription>

Add chart components with the CLI. Replace `{chart-name}` with the chart you want (e.g., `area-chart`, `bar-chart`, `line-chart`, `pie-chart`); it installs all files and dependencies.

</StepDescription>
      <CliBlock commands={["@evilcharts/layerchart-&#123;chart-name&#125;"]} />
    </StepContent>
  </Step>
</Steps>
