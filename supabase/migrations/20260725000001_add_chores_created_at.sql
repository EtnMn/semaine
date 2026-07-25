-- =============================================================================
-- Migration: add_chores_created_at
-- Description: Add created_at column to chores table.
-- =============================================================================

ALTER TABLE public.chores
  ADD COLUMN created_at timestamptz NOT NULL DEFAULT now();
