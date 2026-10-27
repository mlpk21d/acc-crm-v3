-- Required project relationship, ordered render images, and proposal lookup indexes.
CREATE TABLE public.proposals (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE RESTRICT,
 deposit_percentage smallint NOT NULL DEFAULT 50 CHECK (deposit_percentage BETWEEN 10 AND 90 AND deposit_percentage % 10 = 0),
 include_room_finishes boolean NOT NULL DEFAULT false,
 created_by uuid REFERENCES public.crm_users(id) ON DELETE SET NULL,
 updated_by uuid REFERENCES public.crm_users(id) ON DELETE SET NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX proposals_project_idx ON public.proposals(project_id);
CREATE INDEX proposals_created_idx ON public.proposals(created_at DESC,id DESC);
CREATE TABLE public.proposal_media (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 proposal_id uuid NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
 title text NOT NULL DEFAULT '' CHECK(length(title)<=200),
 filename text NOT NULL CHECK(length(filename) BETWEEN 1 AND 255),
 mime_type text NOT NULL CHECK(mime_type IN ('image/jpeg','image/png')),
 image_data bytea NOT NULL CHECK(octet_length(image_data) BETWEEN 1 AND 2097152),
 sort_order integer NOT NULL CHECK(sort_order>=0)
);
CREATE INDEX proposal_media_order_idx ON public.proposal_media(proposal_id,sort_order,id);
-- Accelerate the shared project-name substring search for lists and autocomplete.
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX projects_active_name_trgm_idx ON public.projects USING gin(name gin_trgm_ops) WHERE deleted_at IS NULL;
COMMENT ON TABLE public.proposal_media IS 'Private render images; included in database backups, limited to 5 MiB per proposal by application validation.';
