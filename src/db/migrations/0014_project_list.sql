ALTER TABLE public.projects ADD COLUMN featured boolean NOT NULL DEFAULT false;
CREATE INDEX projects_active_updated_idx ON public.projects(updated_at DESC,id DESC) WHERE deleted_at IS NULL;
CREATE INDEX projects_active_featured_updated_idx ON public.projects(updated_at DESC,id DESC) WHERE deleted_at IS NULL AND featured=true;
CREATE INDEX projects_active_status_updated_idx ON public.projects(status,updated_at DESC,id DESC) WHERE deleted_at IS NULL;
-- Preserve the legacy per-user hidden-column contract with CRM user ownership.
CREATE TABLE public.user_project_list_columns (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL UNIQUE REFERENCES public.crm_users(id) ON DELETE CASCADE,
 hidden_columns text[] NOT NULL DEFAULT ARRAY['sample_signoff','drawing_approved','updated_at']::text[],
 updated_at timestamptz NOT NULL DEFAULT now()
);
