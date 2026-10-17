-- Permanent project status choices. Existing case-insensitive equivalents are reused.
INSERT INTO public.crm_settings_options(category,value,label,color,active,sort_order)
SELECT 'project_status', desired.value, desired.value, '#e5e7eb', true,
       COALESCE((SELECT max(sort_order)+1 FROM public.crm_settings_options WHERE category='project_status'),1)
FROM (VALUES ('Cancelled'),('Archived')) AS desired(value)
WHERE NOT EXISTS (
 SELECT 1 FROM public.crm_settings_options s
 WHERE s.category='project_status' AND lower(s.value)=lower(desired.value)
);

UPDATE public.crm_settings_options SET
 active=true,
 label=CASE WHEN lower(value)='cancelled' THEN 'Cancelled' ELSE 'Archived' END,
 updated_at=now()
WHERE category='project_status' AND lower(value) IN ('cancelled','archived');

CREATE OR REPLACE FUNCTION public.protect_permanent_project_status()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF TG_OP='DELETE' THEN
   IF OLD.category='project_status' AND lower(OLD.value) IN ('cancelled','archived') THEN
     RAISE EXCEPTION 'Permanent project status cannot be deleted';
   END IF;
   RETURN OLD;
 END IF;
 IF OLD.category='project_status' AND lower(OLD.value) IN ('cancelled','archived') THEN
   IF NEW.category IS DISTINCT FROM OLD.category OR NEW.value IS DISTINCT FROM OLD.value
     OR NEW.active IS DISTINCT FROM true
     OR NEW.label IS DISTINCT FROM CASE WHEN lower(OLD.value)='cancelled' THEN 'Cancelled' ELSE 'Archived' END THEN
     RAISE EXCEPTION 'Permanent project status cannot be renamed or deactivated';
   END IF;
 END IF;
 RETURN NEW;
END;
$$;
CREATE TRIGGER protect_permanent_project_status_before_write
BEFORE UPDATE OR DELETE ON public.crm_settings_options
FOR EACH ROW EXECUTE FUNCTION public.protect_permanent_project_status();
