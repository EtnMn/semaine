-- Fix infinite recursion in profiles RLS policies

-- =============================================================================
-- Helper function to get current user's role (bypasses RLS to avoid recursion)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS public.app_role
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;

-- =============================================================================
-- Drop and recreate RLS Policies: Restrict access to profiles table
-- =============================================================================

-- SELECT: Users see only their own profile, admins see all
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_select_own_or_admin"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() OR
    public.get_auth_role() = 'admin'
  );

-- UPDATE: Only admins can update profiles
DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;
CREATE POLICY "profiles_update_admin"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (
    public.get_auth_role() = 'admin'
  )
  WITH CHECK (true);

-- DELETE: Only admins can delete profiles
DROP POLICY IF EXISTS "profiles_delete_admin" ON public.profiles;
CREATE POLICY "profiles_delete_admin"
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (
    public.get_auth_role() = 'admin'
  );

-- INSERT: Disabled (only trigger can insert new profiles)
DROP POLICY IF EXISTS "profiles_insert_disabled" ON public.profiles;
CREATE POLICY "profiles_insert_disabled"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (false);
