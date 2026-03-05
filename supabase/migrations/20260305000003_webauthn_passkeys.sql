-- WebAuthn credential storage (per-user), plus challenge storage for stateless API routes.

create table if not exists public.webauthn_credentials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  credential_id text not null unique,
  public_key text not null,
  counter bigint not null default 0,
  device_type text,
  backed_up boolean,
  transports text[],
  created_at timestamptz not null default now()
);

alter table public.webauthn_credentials enable row level security;

drop policy if exists "webauthn: user can manage own credentials" on public.webauthn_credentials;
create policy "webauthn: user can manage own credentials"
on public.webauthn_credentials
using (auth.uid() = user_id)
with check (auth.uid() = user_id);


create table if not exists public.webauthn_challenges (
  user_id uuid not null references auth.users(id) on delete cascade,
  purpose text not null, -- 'registration' | 'authentication'
  challenge text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, purpose)
);

alter table public.webauthn_challenges enable row level security;

drop policy if exists "webauthn: user can manage own challenges" on public.webauthn_challenges;
create policy "webauthn: user can manage own challenges"
on public.webauthn_challenges
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
