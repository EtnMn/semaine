-- =============================================================================
-- Migration: add_data_api_grants
-- Description: Add explicit GRANT statements for Data API access.
--              Required for Supabase breaking change #45329 (tables not exposed
--              to Data and GraphQL API automatically after October 30, 2026).
--              This migration makes table access explicit and reviewable.
-- =============================================================================

-- 1. Grants for profiles table
-- =============================================================================
-- All authenticated users can select from profiles (enforced by RLS)
GRANT SELECT ON public.profiles TO authenticated;

-- 2. Grants for tasks table
-- =============================================================================
-- All authenticated users can read tasks (enforced by RLS: everyone can read)
GRANT SELECT ON public.tasks TO authenticated;

-- Authenticated users can insert/update/delete tasks (enforced by RLS: admin only)
GRANT INSERT, UPDATE, DELETE ON public.tasks TO authenticated;

-- 3. Grants for sequences (auto-increment IDs if any)
-- =============================================================================
-- Note: Both profiles and tasks use UUID primary keys, not sequences,
-- so explicit sequence grants are not needed.

-- 4. Grants for anon role (public/unauthenticated access)
-- =============================================================================
-- This app does not expose the Data API to anonymous users.
-- No grants to anon role needed.

-- 5. Grants for service_role (backend/admin access via service role key)
-- =============================================================================
-- Grant full access to service_role for administrative operations
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO service_role;
