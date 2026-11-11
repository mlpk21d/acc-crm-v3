ALTER TABLE public.project_rooms
 ADD COLUMN cabinetry_sections jsonb NOT NULL DEFAULT '[]'::jsonb
 CHECK (jsonb_typeof(cabinetry_sections) = 'array');
