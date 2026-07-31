alter table public.scenarios add column if not exists slug text;
alter table public.scenarios add column if not exists track text;

create unique index if not exists scenarios_slug_key
  on public.scenarios (slug)
  where slug is not null;

create unique index if not exists scenario_completions_user_scenario_key
  on public.scenario_completions (user_id, scenario_id)
  where scenario_id is not null;

create index if not exists feedback_items_session_id_idx on public.feedback_items (session_id);
create index if not exists feedback_items_user_id_idx on public.feedback_items (user_id);
create index if not exists scenario_completions_scenario_id_idx on public.scenario_completions (scenario_id);
create index if not exists scores_session_id_idx on public.scores (session_id);
create index if not exists scores_user_id_idx on public.scores (user_id);
create index if not exists sessions_scenario_id_idx on public.sessions (scenario_id);
create index if not exists sessions_user_id_idx on public.sessions (user_id);

alter table public.users enable row level security;
alter table public.scenarios enable row level security;
alter table public.sessions enable row level security;
alter table public.scores enable row level security;
alter table public.feedback_items enable row level security;
alter table public.streaks enable row level security;
alter table public.scenario_completions enable row level security;

drop policy if exists "Users can read own profile" on public.users;
drop policy if exists "Users can create own profile" on public.users;
drop policy if exists "Users can update own profile" on public.users;
drop policy if exists "Anyone can read seed scenarios" on public.scenarios;
drop policy if exists "Users can read own sessions" on public.sessions;
drop policy if exists "Users can create own sessions" on public.sessions;
drop policy if exists "Users can update own sessions" on public.sessions;
drop policy if exists "Users can read own scores" on public.scores;
drop policy if exists "Users can create own scores" on public.scores;
drop policy if exists "Users can update own scores" on public.scores;
drop policy if exists "Users can read own feedback" on public.feedback_items;
drop policy if exists "Users can create own feedback" on public.feedback_items;
drop policy if exists "Users can update own feedback" on public.feedback_items;
drop policy if exists "Users can read own streak" on public.streaks;
drop policy if exists "Users can create own streak" on public.streaks;
drop policy if exists "Users can update own streak" on public.streaks;
drop policy if exists "Users can read own completions" on public.scenario_completions;
drop policy if exists "Users can create own completions" on public.scenario_completions;
drop policy if exists "Users can update own completions" on public.scenario_completions;

create policy "Users can read own profile"
  on public.users for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Users can create own profile"
  on public.users for insert
  to authenticated
  with check ((select auth.uid()) = id);

create policy "Users can update own profile"
  on public.users for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Anyone can read seed scenarios"
  on public.scenarios for select
  to anon, authenticated
  using (is_seed = true);

create policy "Users can read own sessions"
  on public.sessions for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create own sessions"
  on public.sessions for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own sessions"
  on public.sessions for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can read own scores"
  on public.scores for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create own scores"
  on public.scores for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own scores"
  on public.scores for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can read own feedback"
  on public.feedback_items for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create own feedback"
  on public.feedback_items for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own feedback"
  on public.feedback_items for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can read own streak"
  on public.streaks for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create own streak"
  on public.streaks for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own streak"
  on public.streaks for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can read own completions"
  on public.scenario_completions for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create own completions"
  on public.scenario_completions for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own completions"
  on public.scenario_completions for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

do $$
begin
  if exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'rls_auto_enable'
      and p.pronargs = 0
  ) then
    execute 'revoke execute on function public.rls_auto_enable() from public, anon, authenticated';
  end if;
end $$;
