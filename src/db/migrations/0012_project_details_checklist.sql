-- Restore nonfinancial Project View/Edit fields from legacy CRM without changing earlier migrations.
ALTER TABLE public.projects
 ADD COLUMN project_address text,
 ADD COLUMN project_contact_name text,
 ADD COLUMN project_contact_phone text,
 ADD COLUMN project_designer text,
 ADD COLUMN next_step text,
 ADD COLUMN sample_signoff_status text,
 ADD COLUMN order_by_date date,
 ADD COLUMN official_start_date date,
 ADD COLUMN install_date date,
 ADD COLUMN notes text;
CREATE TABLE public.project_checklist (
 project_id uuid PRIMARY KEY REFERENCES public.projects(id) ON DELETE CASCADE,
 drawing_approved boolean NOT NULL DEFAULT false,
 appliance_specs boolean NOT NULL DEFAULT false,
 ceiling_height boolean NOT NULL DEFAULT false,
 floor_thickness boolean NOT NULL DEFAULT false,
 hardware boolean NOT NULL DEFAULT false,
 door_styles boolean NOT NULL DEFAULT false,
 finishes boolean NOT NULL DEFAULT false,
 updated_at timestamptz NOT NULL DEFAULT now()
);
