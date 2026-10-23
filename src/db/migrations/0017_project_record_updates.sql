-- Project-owned child changes must also refresh the parent record's Updated date.
-- Existing dates are preserved: this migration does not rewrite any rows.
CREATE FUNCTION public.touch_project_from_child() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  old_project uuid;
  new_project uuid;
BEGIN
  IF TG_ARGV[0] = 'project_id' THEN
    IF TG_OP <> 'INSERT' THEN old_project := OLD.project_id; END IF;
    IF TG_OP <> 'DELETE' THEN new_project := NEW.project_id; END IF;
  ELSE
    IF TG_OP <> 'INSERT' THEN
      SELECT project_id INTO old_project FROM public.project_rooms WHERE id = OLD.room_id;
    END IF;
    IF TG_OP <> 'DELETE' THEN
      SELECT project_id INTO new_project FROM public.project_rooms WHERE id = NEW.room_id;
    END IF;
  END IF;
  UPDATE public.projects SET updated_at = now()
    WHERE id IN (old_project, new_project) AND deleted_at IS NULL;
  RETURN NULL;
END;
$$;
CREATE TRIGGER project_rooms_touch_project AFTER INSERT OR UPDATE OR DELETE ON public.project_rooms
FOR EACH ROW EXECUTE FUNCTION public.touch_project_from_child('project_id');
CREATE TRIGGER project_financials_touch_project AFTER INSERT OR UPDATE OR DELETE ON public.project_financials
FOR EACH ROW EXECUTE FUNCTION public.touch_project_from_child('project_id');
CREATE TRIGGER project_checklist_touch_project AFTER INSERT OR UPDATE OR DELETE ON public.project_checklist
FOR EACH ROW EXECUTE FUNCTION public.touch_project_from_child('project_id');
CREATE TRIGGER project_room_financials_touch_project AFTER INSERT OR UPDATE OR DELETE ON public.project_room_financials
FOR EACH ROW EXECUTE FUNCTION public.touch_project_from_child('room_id');
CREATE TRIGGER rev_a_shelf_items_touch_project AFTER INSERT OR UPDATE OR DELETE ON public.rev_a_shelf_items
FOR EACH ROW EXECUTE FUNCTION public.touch_project_from_child('room_id');
CREATE TRIGGER jk_room_configs_touch_project AFTER INSERT OR UPDATE OR DELETE ON public.jk_room_configs
FOR EACH ROW EXECUTE FUNCTION public.touch_project_from_child('room_id');
CREATE TRIGGER jk_room_cabinet_items_touch_project AFTER INSERT OR UPDATE OR DELETE ON public.jk_room_cabinet_items
FOR EACH ROW EXECUTE FUNCTION public.touch_project_from_child('room_id');
