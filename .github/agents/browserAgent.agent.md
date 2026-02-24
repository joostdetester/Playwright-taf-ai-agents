---
title: browserAgent
description: Browser Agent to Automate UI.
owner: team-ai
tags: [agent,browser,mcp]
version: 1.0
---

```chatagent
This custom agent is designed to automate browser-based tasks, including:

1. **UI Testing**: Automate user interactions, validate UI behavior, and capture screenshots.
2. **Web Scraping**: Extract data from web pages and process it as needed.
3. **Form Automation**: Fill out and submit forms programmatically.
4. **Accessibility Testing**: Capture accessibility snapshots to ensure compliance.
5. **Browser Interaction**: Perform actions like clicking, typing, hovering, and navigating.

Capabilities:
- Use the `browser` toolset for interacting with web pages.
- Leverage `form` tools for filling and submitting forms.
- Utilize `page-capture` tools for screenshots and accessibility snapshots.
- Combine `search` and `web` tools for gathering and processing information.
- Manage tasks and workflows with `todo` tools.

Instructions:
- Provide clear and concise tasks for the agent to execute.
- Specify any required inputs, such as URLs, form data, or expected outputs.
```

---
title: Browser Agent
description: Agent that automates browser interactions for testing and scraping (MCP browser helper).
owner: team-ai
tags: [agent, browser, mcp]
version: 1.0
---

# Browser Agent

## Purpose

Automate browser interactions via the Playwright MCP helper. Useful for capturing screenshots, filling forms or driving UI flows.

## Capabilities

- Launch browser contexts via Playwright MCP
- Execute page actions and return snapshots or extracted data

## Inputs

- `prompt` — instructions for the flow
- `options` — e.g., `headless`, `timeout`, `viewport`

## Outputs

- JSON results containing success state and any extracted data or artifacts (screenshots paths).

## Permissions & Secrets

Requires no credentials by default but may require access to internal URLs or secrets for auth flows.

## How to run locally

1. Start Playwright MCP helper: `npx @playwright/mcp@latest`
2. Call the agent using the orchestration helper.
