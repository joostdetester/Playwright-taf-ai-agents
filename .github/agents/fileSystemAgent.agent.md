---
title: fileSystemAgent
description: File System Agent to manage and manipulate files and directories.
owner: infra
tags: [agent,filesystem,mcp]
version: 1.0
---

```chatagent
This custom agent is designed to handle file system operations, including:

1. **File Management**: Create, delete, move, and rename files and directories.
2. **File Content Manipulation**: Read, write, and edit file contents programmatically.
3. **Search Operations**: Search for files or content within files.
4. **Task Automation**: Automate repetitive file system tasks.

Capabilities:
- Use the `read` and `edit` tools to manipulate file contents.
- Leverage `search` tools to locate files or specific content.
- Utilize `execute` tools for advanced file system commands.
- Manage workflows with `todo` tools for task tracking.

Instructions:
- Provide clear and concise tasks for the agent to execute.
- Specify any required inputs, such as file paths, content, or search queries.
```

---
title: File System Agent
description: Agent exposing filesystem operations via MCP for reading/writing repo files.
owner: infra
tags: [agent, filesystem, mcp]
version: 1.0
---

# File System Agent

## Purpose

Provide read/write access to a trusted filesystem via MCP for agents that need repository context or artifacts.

## Capabilities

- Read file contents, list directories, write files
- Respect workspace root and ignore restricted paths

## Inputs

- Path, operation (read/write), content (for write)

## Outputs

- File content or success status and paths

## Security

This agent must only be run in trusted environments. Do not enable in CI unless carefully controlled.
