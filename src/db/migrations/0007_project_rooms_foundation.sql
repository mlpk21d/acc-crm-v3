-- First nonfinancial project-room foundation. Financials, J&K and Rev-A-Shelf follow separately.
CREATE TABLE public.project_rooms (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
 room_name text NOT NULL CHECK (length(trim(room_name)) BETWEEN 1 AND 200),
 door_style text,
 drawer_style text,
 species text,
 finish text,
 construction text,
 manufacturer text,
 sort_order integer NOT NULL DEFAULT 0,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX project_rooms_project_order_idx ON public.project_rooms (project_id, sort_order, id);
