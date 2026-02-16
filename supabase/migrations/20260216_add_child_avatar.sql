-- Add avatar key for child profiles
alter table if exists public.children
add column if not exists avatar_key text;
