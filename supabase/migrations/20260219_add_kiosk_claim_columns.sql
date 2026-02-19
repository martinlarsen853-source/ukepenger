alter table public.devices
  add column if not exists device_code text,
  add column if not exists device_secret text,
  add column if not exists active boolean not null default true,
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists idx_devices_device_code_unique
  on public.devices(device_code)
  where device_code is not null;

create index if not exists idx_devices_family_active
  on public.devices(family_id, active);
