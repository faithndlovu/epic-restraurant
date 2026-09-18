-- Admin features: dish photo uploads and admin management.

-- 1. Storage bucket for dish photos ------------------------------------------
-- Public bucket: anyone can view images by URL (the menu is public), but only
-- admins can upload, replace or delete them.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'menu-images',
  'menu-images',
  true,
  5242880, -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

create policy "Admins upload menu images"
on storage.objects for insert to authenticated
with check (bucket_id = 'menu-images' and public.has_role(auth.uid(), 'admin'));

create policy "Admins update menu images"
on storage.objects for update to authenticated
using (bucket_id = 'menu-images' and public.has_role(auth.uid(), 'admin'));

create policy "Admins delete menu images"
on storage.objects for delete to authenticated
using (bucket_id = 'menu-images' and public.has_role(auth.uid(), 'admin'));

-- 2. Admin management ---------------------------------------------------------
-- These run as SECURITY DEFINER so they can read auth.users (to look people up
-- by email), and each one checks the caller is an admin before doing anything.
-- user_roles itself stays read-only to the API: these functions are the only
-- way to change who is an admin.

create or replace function public.list_admins()
returns table (user_id uuid, email text, display_name text, granted_at timestamptz)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'Only admins can view the admin list' using errcode = '42501';
  end if;

  return query
    select r.user_id, u.email::text, p.display_name, r.created_at
    from public.user_roles r
    join auth.users u on u.id = r.user_id
    left join public.profiles p on p.id = r.user_id
    where r.role = 'admin'
    order by r.created_at;
end;
$$;

create or replace function public.grant_admin(_email text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  _target uuid;
begin
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'Only admins can grant admin access' using errcode = '42501';
  end if;

  select id into _target from auth.users where lower(email) = lower(trim(_email));
  if _target is null then
    raise exception 'No account found for %. Ask them to sign up first.', trim(_email)
      using errcode = 'P0002';
  end if;

  insert into public.user_roles (user_id, role)
  values (_target, 'admin')
  on conflict (user_id, role) do nothing;

  return _target;
end;
$$;

create or replace function public.revoke_admin(_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  _admin_count integer;
begin
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'Only admins can remove admin access' using errcode = '42501';
  end if;

  -- Lock the admin rows so two admins removing each other at the same moment
  -- can't both succeed and leave nobody with access.
  perform 1 from public.user_roles where role = 'admin' for update;
  select count(*) into _admin_count from public.user_roles where role = 'admin';

  if _admin_count <= 1
     and exists (select 1 from public.user_roles where user_id = _user_id and role = 'admin') then
    raise exception 'You cannot remove the last admin' using errcode = 'P0001';
  end if;

  delete from public.user_roles where user_id = _user_id and role = 'admin';
end;
$$;

-- SECURITY DEFINER functions are executable by PUBLIC by default. Only signed-in
-- users may call them (and each function then checks for the admin role).
revoke execute on function public.list_admins() from public, anon;
revoke execute on function public.grant_admin(text) from public, anon;
revoke execute on function public.revoke_admin(uuid) from public, anon;
grant execute on function public.list_admins() to authenticated;
grant execute on function public.grant_admin(text) to authenticated;
grant execute on function public.revoke_admin(uuid) to authenticated;
