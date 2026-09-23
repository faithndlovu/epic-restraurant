-- Somewhere for the contact form and the newsletter signup to land.
--
-- Both were decorative before this: the contact form showed "Message Sent"
-- without sending anything, and the newsletter input simply cleared itself.
-- Storing the submission is the durable half of the fix — email notification
-- is best-effort on top, so nothing a visitor types is lost when Resend is
-- unconfigured or rejects the send.

-- 1. Contact messages ---------------------------------------------------------
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Same shape as reservations: the public may insert, only admins may read back.
grant insert on public.contact_messages to anon, authenticated;
grant select, update, delete on public.contact_messages to authenticated;
grant all on public.contact_messages to service_role;
alter table public.contact_messages enable row level security;

-- Dropped first so the whole migration can be re-run against a database that
-- already has part of it; create policy has no "if not exists".
drop policy if exists "Anyone can send a message" on public.contact_messages;
drop policy if exists "Admins read messages" on public.contact_messages;
drop policy if exists "Admins update messages" on public.contact_messages;
drop policy if exists "Admins delete messages" on public.contact_messages;

create policy "Anyone can send a message" on public.contact_messages
  for insert to anon, authenticated with check (true);
create policy "Admins read messages" on public.contact_messages
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins update messages" on public.contact_messages
  for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins delete messages" on public.contact_messages
  for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- 2. Newsletter subscribers ---------------------------------------------------
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  created_at timestamptz not null default now()
);

-- Case-insensitive, so "A@b.com" and "a@b.com" are one subscriber. The signup
-- handler leans on this: a duplicate raises 23505, which it reports to the
-- visitor as "already subscribed" rather than as an error.
create unique index if not exists newsletter_subscribers_email_key
  on public.newsletter_subscribers (lower(email));

grant insert on public.newsletter_subscribers to anon, authenticated;
grant select, delete on public.newsletter_subscribers to authenticated;
grant all on public.newsletter_subscribers to service_role;
alter table public.newsletter_subscribers enable row level security;

drop policy if exists "Anyone can subscribe" on public.newsletter_subscribers;
drop policy if exists "Admins read subscribers" on public.newsletter_subscribers;
drop policy if exists "Admins delete subscribers" on public.newsletter_subscribers;

create policy "Anyone can subscribe" on public.newsletter_subscribers
  for insert to anon, authenticated with check (true);
create policy "Admins read subscribers" on public.newsletter_subscribers
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins delete subscribers" on public.newsletter_subscribers
  for delete to authenticated using (public.has_role(auth.uid(), 'admin'));
