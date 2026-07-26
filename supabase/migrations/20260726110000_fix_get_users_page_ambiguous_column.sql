-- Fix "column reference \"id\" is ambiguous" error in get_users_page().
--
-- The function's RETURNS TABLE (id uuid, ...) clause implicitly declares a
-- PL/pgSQL variable named "id" in scope. The admin check
-- `WHERE id = auth.uid()` inside the function body could therefore resolve
-- to either that output variable or the public.profiles.id column,
-- triggering SQLSTATE 42702. Fix by reusing the existing
-- public.get_auth_role() helper (already used by the profiles RLS
-- policies), which qualifies the column explicitly and avoids RLS
-- recursion.
--
-- Also fixes SQLSTATE 42804 "structure of query does not match function
-- result type": auth.users.email is character varying(255), which does not
-- match the declared "email text" output column, so it must be cast
-- explicitly (u.email::text).

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
  IF public.get_auth_role() IS DISTINCT FROM 'admin' THEN
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
    u.email::text,
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
