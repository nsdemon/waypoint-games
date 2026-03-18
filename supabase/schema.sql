-- Core schema for Baton Rouge MTG Tracker
-- Apply in Supabase SQL editor.

create extension if not exists pgcrypto;

-- Profiles mirror auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- Auto-create a profile row when a new auth user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create table if not exists public.stores (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null default 'Baton Rouge',
  state text not null default 'LA',
  created_at timestamptz not null default now(),
  unique (name, city, state)
);

create type public.deck_review_status as enum ('pending', 'approved', 'rejected');

create table if not exists public.decks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  format text not null default 'Commander',
  storage_path text not null,
  status public.deck_review_status not null default 'pending',
  reviewed_by uuid references public.profiles (id),
  reviewed_at timestamptz,
  review_notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores (id),
  played_at timestamptz not null,
  created_by uuid not null references public.profiles (id),
  notes text,
  created_at timestamptz not null default now()
);

-- Supports 2+ players; exactly one winner is typical.
create table if not exists public.match_players (
  match_id uuid not null references public.matches (id) on delete cascade,
  player_id uuid not null references public.profiles (id) on delete restrict,
  deck_id uuid references public.decks (id) on delete set null,
  is_winner boolean not null default false,
  primary key (match_id, player_id)
);

-- Helpful view for leaderboard
create or replace view public.leaderboard_wins as
select
  p.id as player_id,
  p.display_name,
  count(*) filter (where mp.is_winner) as wins,
  count(*) as games
from public.profiles p
left join public.match_players mp on mp.player_id = p.id
group by p.id, p.display_name;

-- Storage (decklists)
-- Create a private bucket named 'decklists' (Dashboard > Storage) OR run:
-- insert into storage.buckets (id, name, public) values ('decklists', 'decklists', false);
--
-- Policies (Storage > Policies) OR run:
-- Allow authed users to upload into their own folder: <uid>/<file>
-- create policy "decklists upload own folder" on storage.objects
-- for insert to authenticated
-- with check (
--   bucket_id = 'decklists'
--   and (storage.foldername(name))[1] = auth.uid()::text
-- );
--
-- Allow authed users to read their own files; admins can read all via SQL/Service role.
-- create policy "decklists read own folder" on storage.objects
-- for select to authenticated
-- using (
--   bucket_id = 'decklists'
--   and (storage.foldername(name))[1] = auth.uid()::text
-- );

-- RLS
alter table public.profiles enable row level security;
alter table public.stores enable row level security;
alter table public.decks enable row level security;
alter table public.matches enable row level security;
alter table public.match_players enable row level security;

-- Profiles policies
create policy "profiles are readable" on public.profiles
for select using (true);

create policy "users can insert own profile" on public.profiles
for insert with check (auth.uid() = id);

create policy "users can update own profile" on public.profiles
for update using (auth.uid() = id);

-- Stores: readable by all; insert/update only admins
create policy "stores readable" on public.stores
for select using (true);

create policy "stores admins write" on public.stores
for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- Decks: owners can CRUD their decks; admins can review
create policy "decks readable" on public.decks
for select using (true);

create policy "decks owner insert" on public.decks
for insert with check (auth.uid() = owner_id);

create policy "decks owner update" on public.decks
for update using (auth.uid() = owner_id);

create policy "decks owner delete" on public.decks
for delete using (auth.uid() = owner_id);

create policy "decks admins update" on public.decks
for update using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- Matches: any authed user can create/read; only creator can edit/delete
create policy "matches readable" on public.matches
for select using (true);

create policy "matches insert by authed" on public.matches
for insert with check (auth.uid() = created_by);

create policy "matches creator update" on public.matches
for update using (auth.uid() = created_by);

create policy "matches creator delete" on public.matches
for delete using (auth.uid() = created_by);

-- Match players: readable by all; only match creator can manage rows
create policy "match_players readable" on public.match_players
for select using (true);

create policy "match_players managed by match creator" on public.match_players
for all using (
  exists (
    select 1 from public.matches m
    where m.id = match_players.match_id
      and m.created_by = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.matches m
    where m.id = match_players.match_id
      and m.created_by = auth.uid()
  )
);

