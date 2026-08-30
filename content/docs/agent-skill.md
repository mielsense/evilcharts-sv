---
title: Agent Skill
description: Teach coding agents how to install, compose, and debug EvilCharts for Svelte.
image: /og/og-image.png
---

The official `evilcharts-svelte` skill gives a coding agent the library-specific context it needs
before it changes a chart. Install it once, then ask the agent to use it whenever it adds,
customizes, migrates, or debugs EvilCharts components.

## Install the agent skill

Install the skill from this repository with the skills CLI:

```bash
npx skills add mielsense/evilcharts-sv --skill evilcharts-svelte
```

The installed skill includes a chart catalog and an implementation guide. It directs the agent to
the current Markdown documentation before it chooses a registry item, import, component, or prop.

<Link href="https://skills.sh/docs" _blank>Read the skills CLI documentation</Link>, or
<Link href="/skill.md">review the published SKILL.md</Link> before installing it. Public skills are
added to the skills.sh directory from anonymous CLI installation telemetry; the GitHub install
command above works directly and does not depend on a directory listing.

## What the skill covers

- All eight chart families: Area, Line, Bar, Composed, Radar, Pie, Radial, and Sankey
- Choosing between LayerChart and Apache ECharts for each chart
- Compound roots and their provider-specific child components
- Registry installation, focused examples, and complete dashboard blocks
- Chart config, accessibility, selection, loading states, and reduced-motion behavior
- Ordered-dither variants adapted from Dither Kit
- The boundary for mixing providers safely in one application

Provider choice is per chart. An application may render LayerChart and ECharts charts side by side,
but every child inside a compound chart root must come from that root's provider.

## Ask an agent to use it

Name the skill and the outcome you want. The agent can then select the provider, registry item, and
closest documented example without guessing from the original React library.

```text
Use the evilcharts-svelte skill to add an accessible LayerChart area chart with a clickable legend
and reduced-motion support. Start from the closest documented example.
```

For a complete dashboard composition, ask for a block rather than a basic example:

```text
Use the evilcharts-svelte skill to find an ECharts bar block with supporting metrics, then adapt it
to monthly revenue data.
```

## Context7 alternative

If your agent cannot install repository skills, Context7 MCP is the alternative. Context7 retrieves
the current documentation on demand; the installed skill additionally provides the workflow,
catalog, and guardrails described above.

EvilCharts for Svelte is indexed under the exact library ID
<code>/mielsense/evilcharts-sv</code>. Give that ID to the agent so it reads this Svelte port rather
than the original React implementation:

```text
Use Context7 library /mielsense/evilcharts-sv for EvilCharts Svelte docs.
```

<Link href="https://context7.com/mielsense/evilcharts-sv" _blank>Open the EvilCharts for Svelte Context7 page</Link>.

Agents without either integration can read <Link href="/llms.txt">the documentation index</Link>,
<Link href="/llms-full.txt">the full documentation snapshot</Link>, or connect to the
<Link href="/mcp">documentation MCP endpoint</Link>.
