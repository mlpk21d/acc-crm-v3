-- ACC CRM V3 foundational CRM records.
-- Authentication credentials/sessions are intentionally NOT defined here.
-- They will be managed by the selected authentication adapter.
CREATE TABLE public.crm_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id text UNIQUE,
  display_name text NOT NULL CHECK (length(trim(display_name)) > 0),
  email text NOT NULL,
  role text NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'manager', 'staff')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT crm_users_email_not_blank CHECK (length(trim(email)) > 0)
);

CREATE UNIQUE INDEX crm_users_email_active_unique
ON public.crm_users (lower(email))
WHERE deleted_at IS NULL;

CREATE INDEX crm_users_active_idx
ON public.crm_users (is_active)
WHERE deleted_at IS NULL;

CREATE TABLE public.contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_type text NOT NULL DEFAULT 'person' CHECK (contact_type IN ('person', 'business')),
  first_name text,
  last_name text,
  company_name text,
  email text,
  phone text,
  mobile_phone text,
  address_line_1 text,
  address_line_2 text,
  city text,
  state_region text,
  postal_code text,
  country_code text NOT NULL DEFAULT 'US',
  notes text,
  created_by uuid REFERENCES public.crm_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES public.crm_users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT contacts_person_or_company_required CHECK (
    nullif(trim(coalesce(first_name, '')), '') IS NOT NULL
    OR nullif(trim(coalesce(last_name, '')), '') IS NOT NULL
    OR nullif(trim(coalesce(company_name, '')), '') IS NOT NULL
  ),
  CONSTRAINT contacts_country_code_check CHECK (country_code ~ '^[A-Z]{2}$')
);

CREATE INDEX contacts_active_name_idx
ON public.contacts (last_name, first_name, id)
WHERE deleted_at IS NULL;

CREATE INDEX contacts_active_company_idx
ON public.contacts (company_name, id)
WHERE deleted_at IS NULL;

CREATE INDEX contacts_active_created_idx
ON public.contacts (created_at DESC, id DESC)
WHERE deleted_at IS NULL;

CREATE INDEX contacts_active_email_idx
ON public.contacts (lower(email))
WHERE deleted_at IS NULL AND email IS NOT NULL;

CREATE INDEX contacts_active_phone_idx
ON public.contacts (phone)
WHERE deleted_at IS NULL AND phone IS NOT NULL;

COMMENT ON TABLE public.crm_users IS
  'CRM-facing user profile/roles. Passwords and sessions belong to the future authentication provider.';

COMMENT ON TABLE public.contacts IS
  'V3 initial contacts foundation; final field mapping must be reconciled with ACC CRM V3 specification.';
