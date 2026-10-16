-- Add legacy ACC CRM contact attributes without dropping or renaming V3 fields.
-- Apply in version order; does not backfill legacy records.
ALTER TABLE public.contacts
  ADD COLUMN region text,
  ADD COLUMN type text,
  ADD COLUMN location text,
  ADD COLUMN phone_2 text,
  ADD COLUMN website text,
  ADD COLUMN status text,
  ADD COLUMN contacted boolean NOT NULL DEFAULT false,
  ADD COLUMN last_contacted_date timestamptz,
  ADD COLUMN comment text;

CREATE INDEX contacts_active_region_idx ON public.contacts (region) WHERE deleted_at IS NULL;
CREATE INDEX contacts_active_type_idx ON public.contacts (type) WHERE deleted_at IS NULL;
CREATE INDEX contacts_active_status_idx ON public.contacts (status) WHERE deleted_at IS NULL;
CREATE INDEX contacts_active_contacted_idx ON public.contacts (contacted) WHERE deleted_at IS NULL;
CREATE INDEX contacts_active_last_contacted_idx ON public.contacts (last_contacted_date) WHERE deleted_at IS NULL;
