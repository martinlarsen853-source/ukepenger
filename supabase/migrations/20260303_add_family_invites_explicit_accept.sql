create table if not exists public.family_invites (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  email text not null,
  invited_by uuid null,
  token text,
  expires_at timestamptz,
  accepted_at timestamptz null,
  revoked_at timestamptz null,
  created_at timestamptz not null default now()
);

alter table public.family_invites
  add column if not exists token text,
  add column if not exists expires_at timestamptz,
  add column if not exists revoked_at timestamptz null,
  add column if not exists accepted_at timestamptz null;

update public.family_invites
set email = lower(email)
where email <> lower(email);

update public.family_invites
set token = coalesce(token, md5(random()::text || clock_timestamp()::text || coalesce(email, '')))
where token is null;

update public.family_invites
set expires_at = coalesce(expires_at, now() + interval '48 hours')
where expires_at is null;

alter table public.family_invites
  alter column token set not null,
  alter column expires_at set not null;

create unique index if not exists family_invites_token_key on public.family_invites(token);
create unique index if not exists family_invites_family_email_key on public.family_invites(family_id, email);
