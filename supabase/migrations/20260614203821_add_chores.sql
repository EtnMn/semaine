-- =============================================================================
-- Migration: add_chores
-- Description: Create chores table with id, date, task_id.
--              RLS: all authenticated users can read.
--              Insert/Delete operations handled by close-chore edge function.
-- =============================================================================

-- 1. Create chores table
-- -----------------------------------------------------------------------------
CREATE TABLE public.chores (
  id          uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  date        date    NOT NULL,
  task_id     uuid    UNIQUE REFERENCES public.tasks(id) ON DELETE CASCADE
);

-- 2. Enable Row Level Security
-- -----------------------------------------------------------------------------
ALTER TABLE public.chores ENABLE ROW LEVEL SECURITY;

-- 3. RLS policy: all authenticated users can read
-- Note: Insert and delete operations are handled by the close-chore edge function
-- which uses service_role to bypass RLS. Direct client access is not allowed.
-- -----------------------------------------------------------------------------
CREATE POLICY "chores_select_all"
  ON public.chores FOR SELECT
  TO authenticated
  USING (true);
