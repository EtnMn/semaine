-- =============================================================================
-- Migration: add_delete_user_function
-- Description: Create RPC function delete_user to delete a user from auth.users.
--              Only accessible to authenticated users with the admin role.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.delete_user(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: only admins can delete users';
  END IF;

  IF p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Forbidden: you cannot delete your own account';
  END IF;

  DELETE FROM auth.users WHERE id = p_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_user(uuid) TO authenticated;
