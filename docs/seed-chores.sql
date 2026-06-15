-- =============================================================================
-- Script: seed-chores.sql
-- Description: Insert sample chore records into the public.chores table.
--              This script links chores to existing tasks with various dates.
--              Run this script from the Supabase SQL editor (bypasses RLS).
-- =============================================================================

-- Note: Chores are scheduled instances of tasks. Each chore has a unique task_id
-- and a specific date when the task should be performed.

INSERT INTO public.chores (date, task_id)
SELECT
  '2026-06-01'::date,
  (SELECT id FROM public.tasks WHERE name = 'Vacuum the house' LIMIT 1)
UNION ALL
SELECT
  '2026-06-01'::date,
  (SELECT id FROM public.tasks WHERE name = 'Mop the floors' LIMIT 1)
UNION ALL
SELECT
  '2026-06-01'::date,
  (SELECT id FROM public.tasks WHERE name = 'Clean the bathroom' LIMIT 1)
UNION ALL
SELECT
  '2026-06-02'::date,
  (SELECT id FROM public.tasks WHERE name = 'Do the laundry' LIMIT 1)
UNION ALL
SELECT
  '2026-06-03'::date,
  (SELECT id FROM public.tasks WHERE name = 'Dust furniture and shelves' LIMIT 1)
UNION ALL
SELECT
  '2026-06-01'::date,
  (SELECT id FROM public.tasks WHERE name = 'Empty and clean the bins' LIMIT 1)
UNION ALL
SELECT
  '2026-06-01'::date,
  (SELECT id FROM public.tasks WHERE name = 'Maintain the garden' LIMIT 1)
UNION ALL
SELECT
  '2026-06-01'::date,
  (SELECT id FROM public.tasks WHERE name = 'Clean the washing machine' LIMIT 1)
UNION ALL
SELECT
  '2026-06-01'::date,
  (SELECT id FROM public.tasks WHERE name = 'Descale the coffee machine' LIMIT 1)
UNION ALL
SELECT
  '2026-06-05'::date,
  (SELECT id FROM public.tasks WHERE name = 'Clean the windows' LIMIT 1)
UNION ALL
SELECT
  '2026-06-06'::date,
  (SELECT id FROM public.tasks WHERE name = 'Descale the shower and taps' LIMIT 1)
UNION ALL
SELECT
  '2026-06-07'::date,
  (SELECT id FROM public.tasks WHERE name = 'Clean the oven' LIMIT 1)
UNION ALL
SELECT
  '2026-06-08'::date,
  (SELECT id FROM public.tasks WHERE name = 'Defrost and clean the refrigerator' LIMIT 1)
UNION ALL
SELECT
  '2026-06-09'::date,
  (SELECT id FROM public.tasks WHERE name = 'Clean the kitchen extractor hood' LIMIT 1)
UNION ALL
SELECT
  '2026-06-10'::date,
  (SELECT id FROM public.tasks WHERE name = 'Sweep the chimney' LIMIT 1)
UNION ALL
SELECT
  '2026-06-11'::date,
  (SELECT id FROM public.tasks WHERE name = 'Bleed the radiators' LIMIT 1)
UNION ALL
SELECT
  '2026-06-12'::date,
  (SELECT id FROM public.tasks WHERE name = 'Clean the gutters' LIMIT 1)
UNION ALL
SELECT
  '2026-06-13'::date,
  (SELECT id FROM public.tasks WHERE name = 'Replace the ventilation filters' LIMIT 1)
UNION ALL
SELECT
  '2026-06-14'::date,
  (SELECT id FROM public.tasks WHERE name = 'Annual boiler service' LIMIT 1)
UNION ALL
SELECT
  '2026-06-15'::date,
  (SELECT id FROM public.tasks WHERE name = 'Declutter the basement or attic' LIMIT 1);
