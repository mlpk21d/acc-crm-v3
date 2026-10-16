-- Minimal projects foundation. Room and J&K entities await specification verification.
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 200),
  contact_id uuid REFERENCES public.contacts(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'on_hold', 'completed', 'cancelled')),
  description text,
  created_by uuid REFERENCES public.crm_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES public.crm_users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX projects_active_created_idx ON public.projects (created_at DESC, id DESC) WHERE deleted_at IS NULL;
CREATE INDEX projects_active_contact_idx ON public.projects (contact_id) WHERE deleted_at IS NULL;
CREATE INDEX projects_active_status_idx ON public.projects (status) WHERE deleted_at IS NULL;
COMMENT ON TABLE public.projects IS 'Provisional project core; room and J&K workflow require canonical V3 specification.';
