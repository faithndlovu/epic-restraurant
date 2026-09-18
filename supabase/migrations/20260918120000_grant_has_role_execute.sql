-- Restore EXECUTE on has_role for signed-in users.
--
-- 20260624181445 revoked it from anon/authenticated, but the RLS policies on
-- user_roles, profiles, menu_items and reservations all call
-- public.has_role(auth.uid(), 'admin'). Policy expressions run as the querying
-- role, so without EXECUTE every one of those queries fails with
-- "permission denied for function has_role" — admins are bounced out of
-- /admin and can't read or edit reservations or menu items.
--
-- This is safe to grant: the function is SECURITY DEFINER with a pinned
-- search_path and only answers "does this user have this role?".
grant execute on function public.has_role(uuid, public.app_role) to authenticated;

-- anon also needs it: the public menu_items SELECT policy is
-- `is_available = true or public.has_role(...)`, which is evaluated for
-- logged-out visitors too once any item is marked unavailable.
grant execute on function public.has_role(uuid, public.app_role) to anon;
