-- Production readiness migration.
-- Test in a Supabase branch/staging project before applying to Production.

create index if not exists feedback_items_user_id_idx on public.feedback_items (user_id);
create index if not exists feedback_items_session_id_idx on public.feedback_items (session_id);
create index if not exists scenario_completions_user_id_idx on public.scenario_completions (user_id);
create index if not exists scenario_completions_scenario_id_idx on public.scenario_completions (scenario_id);
create index if not exists scores_user_id_idx on public.scores (user_id);
create index if not exists scores_session_id_idx on public.scores (session_id);
create index if not exists sessions_user_id_idx on public.sessions (user_id);
create index if not exists sessions_scenario_id_idx on public.sessions (scenario_id);

create policy "Authenticated users can read seed scenarios"
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

revoke execute on function public.rls_auto_enable() from anon, authenticated;

drop policy if exists "Allow authenticated users to upload avatars" on storage.objects;
drop policy if exists "Allow authenticated users to update avatars" on storage.objects;
drop policy if exists "Allow authenticated users to delete avatars" on storage.objects;
drop policy if exists "For authenticated users 1oj01fe_0" on storage.objects;
drop policy if exists "For authenticated users 1oj01fe_1" on storage.objects;
drop policy if exists "For authenticated users 1oj01fe_2" on storage.objects;
drop policy if exists "For authenticated users 1oj01fe_3" on storage.objects;

create policy "Avatar owners can upload"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );
create policy "Avatar owners can update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'avatars'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );
create policy "Avatar owners can delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );
