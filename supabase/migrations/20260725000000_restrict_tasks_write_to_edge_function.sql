-- =============================================================================
-- Migration: restrict_tasks_write_to_edge_function
-- Description: Drop the tasks_insert_admin and tasks_update_admin RLS
--              policies. Task creation/update now goes exclusively through
--              the `save-task` edge function, which uses the service_role
--              key to bypass RLS and performs its own admin-role check
--              (mirrors the `chores` table, which has no insert/delete RLS
--              policy either since those operations are only handled by
--              the `close-chore` edge function with service_role).
--              tasks_select_all and tasks_delete_admin are left untouched.
-- =============================================================================

DROP POLICY IF EXISTS "tasks_insert_admin" ON public.tasks;
DROP POLICY IF EXISTS "tasks_update_admin" ON public.tasks;
