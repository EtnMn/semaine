CREATE OR REPLACE FUNCTION public.get_users_page(p_limit int, p_offset int)
RETURNS TABLE (
  id uuid,
  email text,
  name text,
  avatar_url text,
  role public.app_role
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'auth'
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: only admins can list users';
  END IF;

  IF p_limit < 1 OR p_limit > 100 THEN
    RAISE EXCEPTION 'Bad Request: p_limit must be between 1 and 100';
  END IF;

  IF p_offset < 0 THEN
    RAISE EXCEPTION 'Bad Request: p_offset must be greater than or equal to 0';
  END IF;

  RETURN QUERY
  SELECT
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'name', '') AS name,
    COALESCE(u.raw_user_meta_data->>'avatar_url', '') AS avatar_url,
    p.role
  FROM auth.users u
  JOIN public.profiles p ON p.id = u.id
  ORDER BY u.email ASC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_users_page(int, int) TO authenticated;

-- =============================================================================
-- RLS Policies: Restrict access to profiles table
-- =============================================================================

-- SELECT: Users see only their own profile, admins see all
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_select_own_or_admin"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() OR
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- UPDATE: Only admins can update profiles
DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;
CREATE POLICY "profiles_update_admin"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (true);

-- DELETE: Only admins can delete profiles
DROP POLICY IF EXISTS "profiles_delete_admin" ON public.profiles;
CREATE POLICY "profiles_delete_admin"
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- INSERT: Disabled (only trigger can insert new profiles)
DROP POLICY IF EXISTS "profiles_insert_disabled" ON public.profiles;
CREATE POLICY "profiles_insert_disabled"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (false);
