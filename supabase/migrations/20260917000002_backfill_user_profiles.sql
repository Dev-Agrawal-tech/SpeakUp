insert into public.users (id, email, name, username, plan_type)
select
  au.id,
  au.email,
  coalesce(au.raw_user_meta_data ->> 'name', split_part(au.email, '@', 1)),
  lower(nullif(au.raw_user_meta_data ->> 'username', '')),
  'free'
from auth.users au
where au.email is not null
on conflict (id) do nothing;