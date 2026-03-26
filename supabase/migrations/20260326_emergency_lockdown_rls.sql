do $$
declare
  tbl text;
  tables text[] := array[
    'public.profiles',
    'public.children',
    'public.tasks',
    'public.child_task_settings',
    'public.families',
    'public.claims',
    'public.payments',
    'public.payment_claims',
    'public.wishlist_items',
    'public.devices',
    'public.family_invites'
  ];
begin
  foreach tbl in array tables loop
    if to_regclass(tbl) is null then
      raise notice 'Skipping emergency RLS lockdown for %, table does not exist.', tbl;
      continue;
    end if;

    execute format('alter table %s enable row level security', tbl);

    execute format('drop policy if exists %I on %s', 'emergency_lockdown_select', tbl);
    execute format(
      'create policy %I on %s as restrictive for select to authenticated, anon using (false)',
      'emergency_lockdown_select',
      tbl
    );

    execute format('drop policy if exists %I on %s', 'emergency_lockdown_insert', tbl);
    execute format(
      'create policy %I on %s as restrictive for insert to authenticated, anon with check (false)',
      'emergency_lockdown_insert',
      tbl
    );

    execute format('drop policy if exists %I on %s', 'emergency_lockdown_update', tbl);
    execute format(
      'create policy %I on %s as restrictive for update to authenticated, anon using (false) with check (false)',
      'emergency_lockdown_update',
      tbl
    );

    execute format('drop policy if exists %I on %s', 'emergency_lockdown_delete', tbl);
    execute format(
      'create policy %I on %s as restrictive for delete to authenticated, anon using (false)',
      'emergency_lockdown_delete',
      tbl
    );
  end loop;
end
$$;
