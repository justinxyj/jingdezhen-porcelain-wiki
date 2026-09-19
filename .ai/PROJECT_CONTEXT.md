# Jingdezhen Porcelain Wiki — Project Context

## Project identity
- Jingdezhen Porcelain Wiki / 景德镇陶瓷数字博物馆
- Jingdezhen-focused digital museum + Wiki knowledge network.
- Public README remains minimal; internal state lives in .ai/.

## Operating model
One coordinating AI covers six working responsibilities: 项目总监、研究策划、产品设计、技术架构、开发工程、测试发布.

## Source-of-truth hierarchy
1. Live Supabase for production data/policies/functions/permissions.
2. GitHub main, merged migrations and application code for repository state.
3. CI/build/test results for deployability.
4. .ai/ for project memory, decisions and current state.
5. README for public introduction.

## Current phase
Phase 1 — knowledge-layer stabilization and project-memory hardening.

## Known recent state
- main at bootstrap: fbd75912d6482e10a8d60990268cccf3690e44df
- Recent work: RLS alignment, canonical 72-step craft catalog, media governance, CI/Museum QA fixes.
- Open issues observed: #2 canonical entry media/timeline interaction; #3 Pages/build verification.
- Recent PRs observed: #15, #14, #13, #12, #6.

## Hard constraints
- No silent production permission or destructive data changes.
- No fabricated historical facts, biographies, provenance or licenses.
- Candidate media is not verified media.
- Do not confuse repo history with live Supabase state.
- No main history rewrite/force-push without explicit approval.
- High-risk changes require plan, impact, rollback and verification.

## Priority
P0 durable memory + live-state verification.
P1 entry/media correctness, schema/data-contract alignment, CI/Pages verification.
P2 source-backed content expansion and museum experience.
P2 later: graph/search/intelligent assistance.

## Handoff
After substantial work update CURRENT_STATE.md, TASKS.md and CHANGELOG.md; update DECISIONS.md when decisions change. New sessions start from these files, then re-check live state where applicable.
