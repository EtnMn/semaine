-- =============================================================================
-- Script: seed-tasks.sql
-- Description: Insert ~20 fictional household chore tasks into the public.tasks table.
--              Run this script from the Supabase SQL editor (bypasses RLS).
-- =============================================================================

INSERT INTO public.tasks (name, description, periodicity, difficulty, started, duration, tags)
VALUES
  (
    'Vacuum the house',
    'Vacuum all rooms including under furniture.',
    'weekly', 'easy', true, 30,
    ARRAY['cleaning', 'floors']
  ),
  (
    'Mop the floors',
    'Clean all hard floors with a mop and a suitable floor cleaner.',
    'weekly', 'easy', true, 45,
    ARRAY['cleaning', 'floors']
  ),
  (
    'Clean the windows',
    'Wash all windows and glass doors inside and outside with a glass cleaner.',
    'monthly', 'medium', false, 90,
    ARRAY['cleaning', 'windows']
  ),
  (
    'Do the laundry',
    'Sort, wash and hang the laundry. Fold and put away once dry.',
    'weekly', 'easy', true, 60,
    ARRAY['laundry', 'cleaning']
  ),
  (
    'Clean the bathroom',
    'Scrub the toilet, sink and shower or bathtub.',
    'weekly', 'easy', true, 30,
    ARRAY['bathroom', 'cleaning']
  ),
  (
    'Descale the shower and taps',
    'Apply a descaling product to the shower walls and taps.',
    'monthly', 'medium', true, 30,
    ARRAY['bathroom', 'maintenance']
  ),
  (
    'Clean the oven',
    'Degrease the inside of the oven and clean the glass door and racks.',
    'monthly', 'medium', false, 45,
    ARRAY['kitchen', 'appliances']
  ),
  (
    'Defrost and clean the refrigerator',
    'Empty, defrost if needed and clean the inside of the refrigerator.',
    'monthly', 'medium', false, 60,
    ARRAY['kitchen', 'appliances']
  ),
  (
    'Descale the coffee machine',
    'Run a descaling cycle using a suitable descaling sachet.',
    'monthly', 'easy', true, 20,
    ARRAY['kitchen', 'appliances']
  ),
  (
    'Empty and clean the bins',
    'Take out the bins on collection days and clean the containers if needed.',
    'weekly', 'easy', true, 15,
    ARRAY['cleaning', 'waste']
  ),
  (
    'Dust furniture and shelves',
    'Wipe down surfaces, frames, ornaments and shelves with a microfibre cloth.',
    'weekly', 'easy', true, 30,
    ARRAY['cleaning', 'dust']
  ),
  (
    'Clean the kitchen extractor hood',
    'Remove and degrease the filters of the kitchen extractor hood.',
    'monthly', 'medium', true, 30,
    ARRAY['kitchen', 'appliances']
  ),
  (
    'Maintain the garden',
    'Mow the lawn, trim the hedges and weed the flower beds.',
    'weekly', 'hard', true, 120,
    ARRAY['garden', 'outdoor']
  ),
  (
    'Sweep the chimney',
    'Have the fireplace or wood stove swept by a professional before the heating season.',
    'yearly', 'hard', false, 60,
    ARRAY['heating', 'safety']
  ),
  (
    'Bleed the radiators',
    'Release trapped air from radiators at the start of the heating season to improve efficiency.',
    'yearly', 'medium', false, 30,
    ARRAY['heating', 'maintenance']
  ),
  (
    'Clean the gutters',
    'Remove leaves and debris from gutters to prevent blockages.',
    'yearly', 'medium', false, 90,
    ARRAY['outdoor', 'roof']
  ),
  (
    'Replace the ventilation filters',
    'Replace or clean the filters of the mechanical ventilation system.',
    'yearly', 'medium', false, 30,
    ARRAY['ventilation', 'maintenance']
  ),
  (
    'Annual boiler service',
    'Have the boiler inspected and serviced by a certified technician.',
    'yearly', 'hard', false, 90,
    ARRAY['heating', 'safety']
  ),
  (
    'Clean the washing machine',
    'Run an empty cycle at high temperature with a washing machine cleaner.',
    'monthly', 'easy', true, 90,
    ARRAY['laundry', 'appliances']
  ),
  (
    'Declutter the basement or attic',
    'Sort through stored items, throw away what is no longer needed and organise the storage space.',
    'yearly', 'hard', false, 180,
    ARRAY['storage', 'organisation']
  );
