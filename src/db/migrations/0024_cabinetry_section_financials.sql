-- Give existing sections stable IDs so editing a name preserves its financials.
UPDATE public.project_rooms r
 SET cabinetry_sections = (
  SELECT jsonb_agg(section || jsonb_build_object('id', gen_random_uuid()) ORDER BY position)
  FROM jsonb_array_elements(r.cabinetry_sections) WITH ORDINALITY AS sections(section, position)
 )
 WHERE jsonb_array_length(r.cabinetry_sections) > 0;

CREATE TABLE public.cabinetry_section_financials (
 room_id uuid NOT NULL REFERENCES public.project_rooms(id) ON DELETE CASCADE,
 section_id uuid NOT NULL,
 room_cost numeric(12,2) NOT NULL CHECK (room_cost >= 0),
 manufacturer_discount numeric(6,3) NOT NULL CHECK (manufacturer_discount BETWEEN 0 AND 100),
 PRIMARY KEY (room_id, section_id)
);

COMMENT ON TABLE public.cabinetry_section_financials IS 'Admin-only cabinetry section costs and discounts.';
