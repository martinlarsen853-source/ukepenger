-- Allow claims without a task (butikk/direct sales registered by admin)
ALTER TABLE public.claims ALTER COLUMN task_id DROP NOT NULL;
