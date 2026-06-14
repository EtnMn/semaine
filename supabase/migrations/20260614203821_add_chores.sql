-- =============================================================================
-- Migration: add_chores
-- Description: Create chores table with id, date, task_id,
--              RLS: everyone can read and update, only admins can add and delete.
-- =============================================================================

-- 1. Create chores table
-- -----------------------------------------------------------------------------
CREATE TABLE public.chores (
  id          uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  date        date    NOT NULL,
  task_id     uuid    UNIQUE REFERENCES public.tasks(id) ON DELETE CASCADE
);

-- 3. Enable Row Level Security
-- -----------------------------------------------------------------------------
ALTER TABLE public.chores ENABLE ROW LEVEL SECURITY;

-- 4. RLS policies: everyone reads and updates, only admins can add and delete
-- -----------------------------------------------------------------------------
CREATE POLICY "chores_select_all"
  ON public.chores FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "chores_update_all"
  ON public.chores FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "chores_insert_admin"
  ON public.chores FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "chores_delete_admin"
  ON public.chores FOR DELETE
  TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );
