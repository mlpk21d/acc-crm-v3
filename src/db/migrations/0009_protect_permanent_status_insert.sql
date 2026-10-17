-- Harden permanent project statuses after migration 0008 without altering its checksum.
-- Prevent case-variant duplicates and re-creation of protected names.
CREATE OR REPLACE FUNCTION public.protect_permanent_project_status()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.category = 'project_status' AND lower(OLD.value) IN ('cancelled', 'archived') THEN
      RAISE EXCEPTION 'Permanent project status cannot be deleted';
    END IF;
    RETURN OLD;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.category = 'project_status' AND lower(NEW.value) IN ('cancelled', 'archived') THEN
      RAISE EXCEPTION 'Permanent project status already exists';
    END IF;
    RETURN NEW;
  END IF;

  IF OLD.category = 'project_status' AND lower(OLD.value) IN ('cancelled', 'archived') THEN
    IF NEW.category IS DISTINCT FROM OLD.category
      OR NEW.value IS DISTINCT FROM OLD.value
      OR NEW.active IS DISTINCT FROM true
      OR NEW.label IS DISTINCT FROM CASE lower(OLD.value) WHEN 'cancelled' THEN 'Cancelled' ELSE 'Archived' END THEN
      RAISE EXCEPTION 'Permanent project status cannot be renamed or deactivated';
    END IF;
  ELSIF NEW.category = 'project_status' AND lower(NEW.value) IN ('cancelled', 'archived') THEN
    RAISE EXCEPTION 'Cannot convert an option into a permanent project status';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_permanent_project_status_before_write ON public.crm_settings_options;
CREATE TRIGGER protect_permanent_project_status_before_write
BEFORE INSERT OR UPDATE OR DELETE ON public.crm_settings_options
FOR EACH ROW EXECUTE FUNCTION public.protect_permanent_project_status();
