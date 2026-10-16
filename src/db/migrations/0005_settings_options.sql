-- Legacy configurable select options (region first; reusable for other categories).
CREATE TABLE public.crm_settings_options (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 category text NOT NULL,
 value text NOT NULL,
 label text NOT NULL,
 color text,
 active boolean NOT NULL DEFAULT true,
 sort_order integer NOT NULL DEFAULT 0,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT crm_settings_options_unique UNIQUE (category, value),
 CONSTRAINT crm_settings_options_category_nonblank CHECK (length(trim(category)) > 0),
 CONSTRAINT crm_settings_options_value_nonblank CHECK (length(trim(value)) > 0)
);
CREATE INDEX crm_settings_options_active_order_idx ON public.crm_settings_options (category, sort_order, label) WHERE active = true;
