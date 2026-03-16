-- =============================================================================
-- Migration: add_users_page_function
-- Description: Create RPC function get_users_page to retrieve paginated users
--              from auth.users joined with public.profiles.
--              Accessible to all authenticated users.
-- =============================================================================

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
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.email::text,
    (u.raw_user_meta_data->>'name')::text AS name,
    (u.raw_user_meta_data->>'avatar_url')::text AS avatar_url,
    p.role
  FROM auth.users u
  JOIN public.profiles p ON p.id = u.id
  ORDER BY u.email ASC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_users_page(int, int) TO authenticated;
