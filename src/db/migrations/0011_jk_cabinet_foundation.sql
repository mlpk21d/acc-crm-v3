-- J&K cabinet configurator foundation. Pricing is confidential: only read through
-- server functions after an explicit admin permission check.
CREATE TABLE public.jk_price_items (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 item text NOT NULL CHECK (length(trim(item)) BETWEEN 1 AND 150),
 description text,
 price numeric(12,2) NOT NULL CHECK (price >= 0),
 msrp numeric(12,2) CHECK (msrp IS NULL OR msrp >= 0),
 active boolean NOT NULL DEFAULT true,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX jk_price_items_search_idx ON public.jk_price_items (lower(item));
CREATE TABLE public.jk_room_configs (
 room_id uuid PRIMARY KEY REFERENCES public.project_rooms(id) ON DELETE CASCADE,
 assembly_count integer NOT NULL DEFAULT 0 CHECK (assembly_count BETWEEN 0 AND 10000),
 locked boolean NOT NULL DEFAULT false,
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.jk_room_cabinet_items (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 room_id uuid NOT NULL REFERENCES public.jk_room_configs(room_id) ON DELETE CASCADE,
 price_item_id uuid REFERENCES public.jk_price_items(id) ON DELETE SET NULL,
 item text NOT NULL CHECK (length(trim(item)) BETWEEN 1 AND 150),
 description text,
 hinge_direction text NOT NULL DEFAULT '' CHECK (hinge_direction IN ('','L','R')),
 unit_price numeric(12,2) NOT NULL CHECK (unit_price >= 0),
 discounted_price numeric(12,2) NOT NULL CHECK (discounted_price >= 0),
 quantity integer NOT NULL DEFAULT 1 CHECK (quantity BETWEEN 1 AND 10000),
 custom boolean NOT NULL DEFAULT false,
 sort_order integer NOT NULL DEFAULT 0,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX jk_room_cabinet_items_order_idx ON public.jk_room_cabinet_items (room_id,sort_order,id);
COMMENT ON TABLE public.jk_price_items IS 'Confidential J&K price list; must only be exposed through admin-authorized server functions.';
COMMENT ON TABLE public.jk_room_cabinet_items IS 'Historical price snapshots for each selected cabinet; avoid recalculation from mutable price catalog.';
