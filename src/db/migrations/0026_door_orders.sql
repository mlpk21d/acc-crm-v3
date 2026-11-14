CREATE TABLE public.door_orders (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 name text NOT NULL CHECK (length(name) BETWEEN 1 AND 160),
 document jsonb NOT NULL CHECK (jsonb_typeof(document) = 'object'),
 revision integer NOT NULL DEFAULT 1,
 created_by uuid REFERENCES public.crm_users(id),
 updated_by uuid REFERENCES public.crm_users(id),
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX door_orders_updated_idx ON public.door_orders(updated_at DESC, id);
