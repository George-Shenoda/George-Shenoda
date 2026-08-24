<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Agent Instructions

## Skill Activation Policy
- **Proactive Skill Usage:** Always review your available skills before planning or executing tasks.
- **Automatic Invocation:** If any task or query even partially matches an available skill (e.g., framework patterns, testing, refactoring, database conventions), invoke that skill immediately using the skill tool without waiting for explicit user prompts.
- **No Manual Confirmation:** Apply relevant skills silently and integrate their best practices directly into your workflow.


# Project Instructions

- always make a new branch for each new feature before starting to work on it


# Git Instructions

- you always use the name of the branch and put it as the commit message
- you always push the branch to the remote repository after each commit
- you always work on a branch and never on the main branch
- after each feature is complete, you always make a pull request to the main branch