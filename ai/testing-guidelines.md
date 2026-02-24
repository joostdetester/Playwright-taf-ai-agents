---
title: Testing Guidelines
description: Testing guidelines and best practices for writing reliable tests and handling test data/secrets.
owner: team-qa
tags: [testing, guidelines]
version: 1.0
---

```markdown
# Testing Guidelines

## General Principles
- Prefer business-level test scenarios over UI implementation details
- Tests must be deterministic and stable
- Avoid flaky tests
- Keep tests readable and maintainable

## Do
- Use data-test-id or role selectors
- Use Page Object Model
- Reuse steps where possible
- Keep step definitions thin
- Validate business outcomes

## Do Not
- Do NOT use hard waits (page.waitForTimeout)
- Do NOT assert on implementation details (CSS, internal IDs)
- Do NOT hardcode test data inside steps
- Do NOT duplicate step logic
- Do NOT perform heavy logic in step definitions

## Test Data
- Use factories or fixtures
- Keep test data configurable per environment
- Do not rely on shared state between tests

## Failure Handling
- Fail fast on critical flows
- Provide clear assertions and error messages

```
