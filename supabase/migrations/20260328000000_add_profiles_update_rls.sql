-- =============================================================================
-- Migration: add_profiles_update_rls
-- Description: Add RLS policy allowing admins to update any profile role,
--              except their own.
-- =============================================================================

CREATE POLICY "profiles_update_admin"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    AND id != auth.uid()
  )
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    AND id != auth.uid()
  );
