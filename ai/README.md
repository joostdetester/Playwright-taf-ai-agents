---
title: AI Docs Index
description: Index of AI prompts, guidelines and templates for agents.
owner: team-ai
tags: [docs, ai, prompts]
---

# AI documentation

This folder contains documentation and templates for prompts, testing guidelines and agent integration.

Contents:

- `agent-template.md` — template for documenting an agent (see below).
- `video-to-test-readme.md` — stap-voor-stap workflow: video → prompt → feature/steps/POM → run.
- `playwright-bdd-style.md` — style guide for Playwright BDD (if present).
- `testing-guidelines.md` — testing practices and secrets handling.
- `project-context.md` — project-level context (goals, constraints).

If you have existing `.md` files from a previous project, copy them here and add the required YAML frontmatter (see `agent-template.md` for recommended fields).

Quick start

1. Add or update markdown files in this folder.
2. Ensure each file has YAML frontmatter with `title`, `description`, `owner`, and `tags`.
3. Open a PR — the repository will validate frontmatter automatically.
