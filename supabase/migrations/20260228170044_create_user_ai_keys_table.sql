create table if not exists public.user_ai_keys (
  user_id uuid primary key references auth.users(id) on delete cascade,
  encrypted_google_api_key text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at_user_ai_keys()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_user_ai_keys_updated_at on public.user_ai_keys;
create trigger trg_user_ai_keys_updated_at
before update on public.user_ai_keys
for each row
execute function public.set_updated_at_user_ai_keys();

alter table public.user_ai_keys enable row level security;

drop policy if exists "Users can read own AI key" on public.user_ai_keys;
create policy "Users can read own AI key"
on public.user_ai_keys
for select
using (auth.uid() = user_id);

drop policy if exists "Users can write own AI key" on public.user_ai_keys;
create policy "Users can write own AI key"
on public.user_ai_keys
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own AI key" on public.user_ai_keys;
create policy "Users can update own AI key"
on public.user_ai_keys
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own AI key" on public.user_ai_keys;
create policy "Users can delete own AI key"
on public.user_ai_keys
for delete
using (auth.uid() = user_id);
