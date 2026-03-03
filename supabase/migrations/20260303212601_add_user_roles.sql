-- =============================================================================
-- Migration: add_user_roles
-- Description: Create profiles table (id + role) linked to auth.users.
--              Auto-create profile on user sign-up via trigger.
--              First user becomes admin, subsequent users default to 'user'.
--              Secure role update via SECURITY DEFINER function (admin only).
-- =============================================================================

-- 1. Create app_role enum type
-- -----------------------------------------------------------------------------
CREATE TYPE public.app_role AS ENUM ('user', 'admin');

-- 2. Create profiles table (id linked to auth.users, role only)
-- -----------------------------------------------------------------------------
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'user'
);

-- 3. Trigger function: auto-create profile on user sign-up
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  _role public.app_role;
BEGIN
  -- First user ever registered becomes admin
  IF (SELECT count(*) FROM public.profiles) = 0 THEN
    _role := 'admin';
  ELSE
    _role := 'user';
  END IF;

  INSERT INTO public.profiles (id, role)
  VALUES (new.id, _role);

  RETURN new;
END;
$$;

-- 4. Trigger on auth.users insert
-- -----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 5. Enable RLS on profiles
-- -----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies
-- -----------------------------------------------------------------------------

-- All authenticated users can read all profiles
CREATE POLICY "profiles_select_authenticated"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- 7. Secure function to update user role (admin only)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_user_role(target_user_id uuid, new_role public.app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  caller_role public.app_role;
BEGIN
  -- Check caller is admin
  SELECT role INTO caller_role
  FROM public.profiles
  WHERE id = auth.uid();

  IF caller_role IS NULL OR caller_role != 'admin' THEN
    RAISE EXCEPTION 'Only admins can update user roles';
  END IF;

  -- Prevent admin from removing their own admin role
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot change your own role';
  END IF;

  UPDATE public.profiles
  SET role = new_role
  WHERE id = target_user_id;
END;
$$;

-- Grant execute to authenticated users (actual authorization is in the function body)
GRANT EXECUTE ON FUNCTION public.update_user_role(uuid, public.app_role) TO authenticated;
