-- DocumentTemplate and PageContent must only be accessible via the service role
-- (server-side Prisma). No authenticated user should be able to query these
-- tables directly through the Supabase REST API.
-- Dropping the permissive read policies leaves RLS enabled with no grant,
-- which means any non-service-role request is denied by default.

DROP POLICY IF EXISTS "Authenticated users read page content"       ON "PageContent";
DROP POLICY IF EXISTS "Authenticated users read document templates" ON "DocumentTemplate";
