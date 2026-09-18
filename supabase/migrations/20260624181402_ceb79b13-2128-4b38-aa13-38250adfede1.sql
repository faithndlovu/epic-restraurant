-- 1. Roles
create type public.app_role as enum ('admin', 'user');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  email text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "Users read own profile" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update to authenticated using (auth.uid() = id);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "Users read own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles where user_id = _user_id and role = _role
  )
$$;

create policy "Admins read all roles" on public.user_roles for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins read all profiles" on public.profiles for select to authenticated using (public.has_role(auth.uid(), 'admin'));

-- 2. Auto-create profile + assign 'user' role on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'user')
  on conflict do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3. Menu items
create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  price numeric(10,2) not null check (price >= 0),
  image_url text,
  category text not null check (category in ('Starters','Main Courses','Desserts','Drinks')),
  tag text,
  sort_order integer not null default 0,
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.menu_items to anon, authenticated;
grant insert, update, delete on public.menu_items to authenticated;
grant all on public.menu_items to service_role;
alter table public.menu_items enable row level security;

create policy "Anyone reads available items" on public.menu_items for select to anon, authenticated using (is_available = true or public.has_role(auth.uid(), 'admin'));
create policy "Admins insert items" on public.menu_items for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins update items" on public.menu_items for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins delete items" on public.menu_items for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger menu_items_updated before update on public.menu_items for each row execute function public.tg_set_updated_at();

-- 4. Reservations
create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  party_size integer not null check (party_size between 1 and 50),
  reservation_date date not null,
  reservation_time text not null,
  requests text,
  status text not null default 'pending' check (status in ('pending','confirmed','cancelled','completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant insert on public.reservations to anon, authenticated;
grant select, update, delete on public.reservations to authenticated;
grant all on public.reservations to service_role;
alter table public.reservations enable row level security;

create policy "Anyone can submit a reservation" on public.reservations for insert to anon, authenticated with check (true);
create policy "Admins read reservations" on public.reservations for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins update reservations" on public.reservations for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins delete reservations" on public.reservations for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

create trigger reservations_updated before update on public.reservations for each row execute function public.tg_set_updated_at();

-- 5. Seed menu
insert into public.menu_items (name, description, price, image_url, category, tag, sort_order) values
('Crispy Chicken Bites', 'Golden-fried chicken morsels tossed in our signature chili glaze, served with cool herb dip.', 6.00, '/images/epicfood3.png', 'Starters', 'Signature', 1),
('Garden Crisp Salad', 'Mixed leaves, heirloom tomato, cucumber and feta with citrus-honey vinaigrette.', 5.00, '/images/epicfood2.png', 'Starters', null, 2),
('Spring Rolls', 'Hand-rolled vegetable spring rolls, sweet chili dipping sauce.', 4.50, '/images/epicsamosas.png', 'Starters', null, 3),
('Epic Mixed Grill', 'Char-grilled steak, pork chop, chicken thigh & wings on a bed of golden fries.', 18.00, '/images/epicfood3.png', 'Main Courses', 'Chef''s Pick', 1),
('Epic Big Breakfast', 'Sirloin steak, eggs your way, baked beans, mushrooms, tomato and toast.', 12.00, '/images/epicfood.png', 'Main Courses', null, 2),
('Brown Plate Special', 'Crispy chicken, hash browns, beans and double eggs — paired with cappuccino.', 11.00, '/images/epicfood2.png', 'Main Courses', null, 3),
('Sadza & Beef Stew', 'Tender slow-braised beef with traditional sadza, greens and gravy.', 9.00, '/images/epicfood3.png', 'Main Courses', 'Local Favourite', 4),
('Decadent Brownie', 'Warm dark chocolate brownie with vanilla bean ice cream.', 5.00, '/images/epiccakeslice.png', 'Desserts', null, 1),
('Classic Cheesecake', 'Velvety New York-style cheesecake with seasonal berry coulis.', 5.50, '/images/epiccakes.png', 'Desserts', null, 2),
('Signature Cappuccino', 'Double-shot espresso, silky steamed milk, hand-poured rosetta.', 3.00, '/images/epicfood2.png', 'Drinks', null, 1),
('Berry Milkshake', 'Strawberry, raspberry and vanilla blended into a thick, dreamy shake.', 3.50, '/images/epicmilkshake.png', 'Drinks', null, 2),
('Sunset Mocktail', 'Citrus, grenadine and tropical juices over crushed ice.', 4.00, '/images/epicdrinks.png', 'Drinks', null, 3);
