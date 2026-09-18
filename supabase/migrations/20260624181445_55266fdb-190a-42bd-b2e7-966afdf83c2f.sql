-- Set immutable search_path on trigger fn
create or replace function public.tg_set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin new.updated_at = now(); return new; end;
$$;

-- Revoke direct EXECUTE from API roles on SECURITY DEFINER fns
revoke execute on function public.has_role(uuid, public.app_role) from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- Replace permissive insert policy with validated one
drop policy if exists "Anyone can submit a reservation" on public.reservations;
create policy "Anyone can submit a reservation"
on public.reservations
for insert
to anon, authenticated
with check (
  length(name) between 1 and 120
  and length(email) between 5 and 255
  and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  and length(phone) between 5 and 40
  and party_size between 1 and 50
  and reservation_date >= current_date
  and coalesce(length(requests), 0) <= 1000
);
