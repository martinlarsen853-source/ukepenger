-- RLS policies for FamilieOppgaver MVP
-- Goal: allow authenticated users to create their own family/profile on first login
-- and access only data in their own family.

alter table public.families enable row level security;
alter table public.profiles enable row level security;
alter table public.children enable row level security;
alter table public.tasks enable row level security;
alter table public.child_task_settings enable row level security;
alter table public.devices enable row level security;
alter table public.claims enable row level security;
alter table public.payments enable row level security;
alter table public.payment_claims enable row level security;

drop policy if exists families_select on public.families;
create policy families_select on public.families
for select
using (
  exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid()
      and p.family_id = public.families.id
  )
);

drop policy if exists families_insert on public.families;
create policy families_insert on public.families
for insert
with check (auth.uid() is not null);

drop policy if exists families_update on public.families;
create policy families_update on public.families
for update
using (
  exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid()
      and p.family_id = public.families.id
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid()
      and p.family_id = public.families.id
  )
);

drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
for select
using (user_id = auth.uid());

drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles
for insert
with check (user_id = auth.uid());

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists children_all_family on public.children;
create policy children_all_family on public.children
for all
using (
  exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid()
      and p.family_id = public.children.family_id
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid()
      and p.family_id = public.children.family_id
  )
);

drop policy if exists tasks_all_family on public.tasks;
create policy tasks_all_family on public.tasks
for all
using (
  exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid()
      and p.family_id = public.tasks.family_id
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid()
      and p.family_id = public.tasks.family_id
  )
);

drop policy if exists devices_all_family on public.devices;
create policy devices_all_family on public.devices
for all
using (
  exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid()
      and p.family_id = public.devices.family_id
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid()
      and p.family_id = public.devices.family_id
  )
);

drop policy if exists claims_all_family on public.claims;
create policy claims_all_family on public.claims
for all
using (
  exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid()
      and p.family_id = public.claims.family_id
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid()
      and p.family_id = public.claims.family_id
  )
);

drop policy if exists payments_all_family on public.payments;
create policy payments_all_family on public.payments
for all
using (
  exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid()
      and p.family_id = public.payments.family_id
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid()
      and p.family_id = public.payments.family_id
  )
);

drop policy if exists child_task_settings_all_family on public.child_task_settings;
create policy child_task_settings_all_family on public.child_task_settings
for all
using (
  exists (
    select 1
    from public.children c
    join public.profiles p on p.family_id = c.family_id
    where p.user_id = auth.uid()
      and c.id = public.child_task_settings.child_id
  )
)
with check (
  exists (
    select 1
    from public.children c
    join public.profiles p on p.family_id = c.family_id
    where p.user_id = auth.uid()
      and c.id = public.child_task_settings.child_id
  )
);

drop policy if exists payment_claims_all_family on public.payment_claims;
create policy payment_claims_all_family on public.payment_claims
for all
using (
  exists (
    select 1
    from public.payments pay
    join public.profiles p on p.family_id = pay.family_id
    where p.user_id = auth.uid()
      and pay.id = public.payment_claims.payment_id
  )
)
with check (
  exists (
    select 1
    from public.payments pay
    join public.profiles p on p.family_id = pay.family_id
    where p.user_id = auth.uid()
      and pay.id = public.payment_claims.payment_id
  )
);
