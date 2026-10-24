-- EnglishKu schema. RLS is enabled on every table. Idempotent: safe to run more than once (never drops tables or data).
-- Extra columns beyond the product spec: profiles.last_active_date (streak), categories.emoji and
-- vocabulary.emoji (picture shown until image_url assets are uploaded).

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ───────── profiles (one child profile per parent account) ─────────
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (display_name is null or char_length(display_name) between 1 and 30),
  age_group text check (age_group in ('4-6', '7-10')),
  avatar_url text,
  daily_goal_minutes integer check (daily_goal_minutes in (5, 10, 15)),
  total_stars integer not null default 0 check (total_stars >= 0),
  current_streak integer not null default 0 check (current_streak >= 0),
  last_active_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check ((select auth.uid()) = id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_delete_own" on public.profiles
  for delete to authenticated using ((select auth.uid()) = id);

-- Create an empty profile on sign-up; onboarding fills it in. Only the id is stored.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ───────── content (read-only for app users) ─────────
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  image_url text,
  emoji text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories (id) on delete cascade,
  title text not null,
  description text,
  age_group text not null default 'all' check (age_group in ('all', '4-6', '7-10')),
  level integer not null default 1,
  sort_order integer not null default 0,
  is_locked boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.vocabulary (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  word text not null,
  translation text not null,
  example_sentence text,
  image_url text,
  emoji text,
  audio_url text,
  difficulty integer not null default 1 check (difficulty between 1 and 3),
  created_at timestamptz not null default now()
);

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  icon text,
  requirement_type text not null,
  requirement_value integer not null default 1
);

create index if not exists lessons_category_idx on public.lessons (category_id, sort_order);
create index if not exists vocabulary_lesson_idx on public.vocabulary (lesson_id);

alter table public.categories enable row level security;
alter table public.lessons enable row level security;
alter table public.vocabulary enable row level security;
alter table public.achievements enable row level security;

-- Signed-in users can read content; nobody can write it from the app (manage via dashboard/migrations).
drop policy if exists "categories_read" on public.categories;
create policy "categories_read" on public.categories for select to authenticated using (true);
drop policy if exists "lessons_read" on public.lessons;
create policy "lessons_read" on public.lessons for select to authenticated using (true);
drop policy if exists "vocabulary_read" on public.vocabulary;
create policy "vocabulary_read" on public.vocabulary for select to authenticated using (true);
drop policy if exists "achievements_read" on public.achievements;
create policy "achievements_read" on public.achievements for select to authenticated using (true);

-- ───────── per-user data ─────────
create table if not exists public.user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  status text not null default 'in_progress' check (status in ('in_progress', 'completed')),
  score integer not null default 0 check (score between 0 and 100),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create table if not exists public.user_vocabulary (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  vocabulary_id uuid not null references public.vocabulary (id) on delete cascade,
  is_favorite boolean not null default false,
  mastery_level integer not null default 0 check (mastery_level between 0 and 3),
  last_reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, vocabulary_id)
);

create table if not exists public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  achievement_id uuid not null references public.achievements (id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  unique (user_id, achievement_id)
);

drop trigger if exists user_progress_set_updated_at on public.user_progress;
create trigger user_progress_set_updated_at
  before update on public.user_progress
  for each row execute function public.set_updated_at();

alter table public.user_progress enable row level security;
alter table public.user_vocabulary enable row level security;
alter table public.user_achievements enable row level security;

drop policy if exists "user_progress_own" on public.user_progress;
create policy "user_progress_own" on public.user_progress
  for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "user_vocabulary_own" on public.user_vocabulary;
create policy "user_vocabulary_own" on public.user_vocabulary
  for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "user_achievements_own" on public.user_achievements;
create policy "user_achievements_own" on public.user_achievements
  for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
