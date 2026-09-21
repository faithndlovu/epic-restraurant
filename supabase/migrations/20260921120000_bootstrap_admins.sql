-- Bootstrapping the first admin.
--
-- public.grant_admin() refuses unless the caller is already an admin, so a
-- fresh project has a chicken-and-egg problem: nobody can hand out the first
-- admin role through the app. This adds a small allowlist that the signup
-- trigger consults, plus a backfill for accounts that already exist.
--
-- No email addresses are seeded in this file on purpose. It is version
-- controlled and travels with the repo, so addresses go in at deploy time:
--
--   insert into public.bootstrap_admins (email) values ('owner@example.com');
--   select public.sync_bootstrap_admins();   -- if they already signed up
--
-- Run both from the Supabase SQL editor.

-- 1. The allowlist ------------------------------------------------------------
create table if not exists public.bootstrap_admins (
  email text primary key,
  note text,
  created_at timestamptz not null default now()
);

-- RLS on with no policies, and no grants to anon/authenticated: the table is
-- invisible to the REST API entirely. Only service_role and the SQL editor can
-- read or write it, so a browser can never add itself to the allowlist.
alter table public.bootstrap_admins enable row level security;
revoke all on public.bootstrap_admins from anon, authenticated;
grant all on public.bootstrap_admins to service_role;

-- 2. Grant on signup ----------------------------------------------------------
create or replace function public.apply_bootstrap_admin(_user_id uuid, _email text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if _email is null or not exists (
    select 1 from public.bootstrap_admins where lower(email) = lower(trim(_email))
  ) then
    return false;
  end if;

  insert into public.user_roles (user_id, role)
  values (_user_id, 'admin')
  on conflict (user_id, role) do nothing;

  return true;
end;
$$;

revoke execute on function public.apply_bootstrap_admin(uuid, text) from public, anon, authenticated;

-- Extends the existing trigger function; the on_auth_user_created trigger
-- already points here, so replacing the body is enough. The profile and 'user'
-- role behaviour is unchanged from the original migration.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'display_name',
      new.raw_user_meta_data->>'full_name',
      split_part(new.email, '@', 1)
    )
  )
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'user')
  on conflict do nothing;

  -- Anyone on the allowlist becomes an admin the moment they sign up.
  perform public.apply_bootstrap_admin(new.id, new.email);

  return new;
end;
$$;

-- 3. Backfill -----------------------------------------------------------------
-- Covers the other ordering: the account already existed when the email was
-- added to the allowlist. Returns how many roles it granted; safe to re-run.
create or replace function public.sync_bootstrap_admins()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  _granted integer;
begin
  with granted as (
    insert into public.user_roles (user_id, role)
    select u.id, 'admin'::public.app_role
    from auth.users u
    join public.bootstrap_admins b on lower(b.email) = lower(u.email)
    on conflict (user_id, role) do nothing
    returning 1
  )
  select count(*) into _granted from granted;

  return _granted;
end;
$$;

revoke execute on function public.sync_bootstrap_admins() from public, anon, authenticated;

-- Run it now so that adding this migration to a project whose admin already
-- signed up does the right thing without a manual step.
select public.sync_bootstrap_admins();
