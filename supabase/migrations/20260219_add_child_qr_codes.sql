create extension if not exists pgcrypto;

create table if not exists public.child_qr_codes (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  code text not null unique,
  secret_hash text not null,
  active boolean not null default true,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_child_qr_codes_child_active
  on public.child_qr_codes(child_id);

alter table public.child_qr_codes enable row level security;

drop policy if exists child_qr_codes_all_family on public.child_qr_codes;
create policy child_qr_codes_all_family on public.child_qr_codes
for all
using (
  exists (
    select 1
    from public.children c
    join public.profiles p on p.family_id = c.family_id
    where p.user_id = auth.uid()
      and c.id = public.child_qr_codes.child_id
  )
)
with check (
  exists (
    select 1
    from public.children c
    join public.profiles p on p.family_id = c.family_id
    where p.user_id = auth.uid()
      and c.id = public.child_qr_codes.child_id
  )
);
