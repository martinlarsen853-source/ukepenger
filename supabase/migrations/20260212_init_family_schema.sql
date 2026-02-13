-- Enable UUIDs
create extension if not exists "uuid-ossp";

-- Families
create table if not exists public.families (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz not null default now(),
  name text not null,
  approval_mode text not null default 'REQUIRE_APPROVAL', -- or AUTO_APPROVE
  support_code text
);

-- Profiles (admins) - links auth.users -> family
create table if not exists public.profiles (
  user_id uuid primary key,
  family_id uuid not null references public.families(id) on delete cascade,
  role text not null default 'ADMIN',
  created_at timestamptz not null default now()
);

-- Children
create table if not exists public.children (
  id uuid primary key default uuid_generate_v4(),
  family_id uuid not null references public.families(id) on delete cascade,
  name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Tasks
create table if not exists public.tasks (
  id uuid primary key default uuid_generate_v4(),
  family_id uuid not null references public.families(id) on delete cascade,
  title text not null,
  amount_ore integer not null check (amount_ore >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Per-child task visibility
create table if not exists public.child_task_settings (
  child_id uuid not null references public.children(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (child_id, task_id)
);

-- Devices (kiosk)
create table if not exists public.devices (
  id uuid primary key default uuid_generate_v4(),
  family_id uuid not null references public.families(id) on delete cascade,
  name text not null default 'Kiosk',
  token_hash text not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

-- Claims
create table if not exists public.claims (
  id uuid primary key default uuid_generate_v4(),
  family_id uuid not null references public.families(id) on delete cascade,
  child_id uuid not null references public.children(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  amount_ore integer not null check (amount_ore >= 0),
  status text not null default 'SENT', -- SENT | APPROVED | REJECTED | PAID
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  decided_by uuid, -- profiles.user_id
  paid_at timestamptz
);

-- Payments
create table if not exists public.payments (
  id uuid primary key default uuid_generate_v4(),
  family_id uuid not null references public.families(id) on delete cascade,
  child_id uuid not null references public.children(id) on delete cascade,
  method text not null, -- VIPPS | CASH | BANK | OTHER
  amount_ore integer not null check (amount_ore >= 0),
  note text,
  created_at timestamptz not null default now(),
  created_by uuid -- profiles.user_id
);

create table if not exists public.payment_claims (
  payment_id uuid not null references public.payments(id) on delete cascade,
  claim_id uuid not null references public.claims(id) on delete cascade,
  primary key (payment_id, claim_id)
);

-- Helpful indexes
create index if not exists idx_children_family on public.children(family_id);
create index if not exists idx_tasks_family on public.tasks(family_id);
create index if not exists idx_claims_family_status on public.claims(family_id, status);
create index if not exists idx_claims_child on public.claims(child_id);
