# Decisions

## D-001 — GitHub is durable project memory
Date: 2026-09-19
Status: accepted

Chat sessions are temporary. Durable project memory is stored in .ai/ so a new conversation or another AI can recover state.

## D-002 — Public README remains minimal
Date: 2026-09-19
Status: accepted

Public README primarily exposes the museum/site link. Internal notes belong in .ai/, Issues and PRs.

## D-003 — One coordinator, six internal roles
Date: 2026-09-19
Status: accepted

Use one coordinating AI with six working responsibilities instead of six independent conversational agents unless a future task clearly benefits from autonomous execution.

## D-004 — High-risk production changes are gated
Date: 2026-09-19
Status: accepted

Production RLS/permission/destructive data changes require explicit approval after plan, impact, rollback and tests.
