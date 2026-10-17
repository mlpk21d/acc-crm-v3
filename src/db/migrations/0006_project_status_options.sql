-- Permit administrator-managed Project Status options rather than the original five fixed values.
-- Preserve existing status strings and project records. Migration 0005 must run first.
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_status_check;
ALTER TABLE public.projects ADD CONSTRAINT projects_status_nonblank
  CHECK (length(trim(status)) BETWEEN 1 AND 100);
ALTER TABLE public.projects ALTER COLUMN status DROP DEFAULT;
