# B-42501 rollback

**When**: after the forward migration `20260923_b42501_graph_views_read_media_public.sql` has been applied to production, and you need to restore pre-B graph view bodies.

**Do not** use this to “undo” a PR that was only merged to git — this is for **database** rollback after apply.

## Steps (极光 / ops only)

1. Re-create both views from the pre-B bodies with invoker kept:

```sql
CREATE OR REPLACE VIEW public.knowledge_graph_nodes
WITH (security_invoker = true) AS
-- paste body from pre-B-knowledge_graph_nodes.sql

CREATE OR REPLACE VIEW public.knowledge_graph_edges
WITH (security_invoker = true) AS
-- paste body from pre-B-knowledge_graph_edges.sql
```

2. Files in this directory:
   - `pre-B-knowledge_graph_nodes.sql` — view body only (no CREATE wrapper)
   - `pre-B-knowledge_graph_edges.sql` — view body only (no CREATE wrapper)

3. Expected after rollback:
   - anon querying `knowledge_graph_edges` / nodes that touch `media` → **42501** again
   - staff direct `media` access unchanged
   - **Still forbidden**: `GRANT SELECT ON public.media TO anon`
   - **Do not** alter `media_public` invoker (C3 separate)

## Forward red lines (unchanged)

- No `GRANT media TO anon`
- Keep `security_invoker=true` on both graph views
- Do not change `knowledge_recommendations` definition
- Do not change `media_public` invoker
