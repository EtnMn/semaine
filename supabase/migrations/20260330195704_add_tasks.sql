-- =============================================================================
-- Migration: add_tasks
-- Description: Create tasks table with id, name, periodicity, status,
--              duration (minutes), difficulty, and tags.
--              RLS: everyone can read, only admins can insert/update/delete.
-- =============================================================================

-- 1. Create enum types
-- -----------------------------------------------------------------------------
CREATE TYPE public.task_periodicity AS ENUM ('unique', 'daily', 'weekly', 'monthly', 'yearly');
CREATE TYPE public.task_difficulty AS ENUM ('easy', 'medium', 'hard');

-- 2. Create tasks table
-- -----------------------------------------------------------------------------
CREATE TABLE public.tasks (
  id          uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text    NOT NULL,
  description text    NOT NULL DEFAULT '',
  periodicity public.task_periodicity NOT NULL DEFAULT 'unique',
  difficulty  public.task_difficulty NOT NULL DEFAULT 'medium',
  started     boolean NOT NULL DEFAULT true,
  duration    integer CHECK (duration >= 0),
  tags        text[]  NOT NULL DEFAULT '{}'
);

-- 3. Enable Row Level Security
-- -----------------------------------------------------------------------------
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 4. RLS policies: everyone can read, only admins can write
-- -----------------------------------------------------------------------------
CREATE POLICY "tasks_select_all"
  ON public.tasks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "tasks_insert_admin"
  ON public.tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "tasks_update_admin"
  ON public.tasks FOR UPDATE
  TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "tasks_delete_admin"
  ON public.tasks FOR DELETE
  TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );
