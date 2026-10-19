-- Confidential project and room financial information. No general-project SELECT includes these columns.
CREATE TABLE public.project_financials (
 project_id uuid PRIMARY KEY REFERENCES public.projects(id) ON DELETE CASCADE,
 install_cost numeric(12,2) NOT NULL DEFAULT 0 CHECK (install_cost>=0),
 misc_cost numeric(12,2) NOT NULL DEFAULT 0 CHECK (misc_cost>=0),
 drawing_cost numeric(12,2) NOT NULL DEFAULT 0 CHECK (drawing_cost>=0),
 freight numeric(12,2) NOT NULL DEFAULT 0 CHECK (freight>=0),
 doors_pulls numeric(12,2) NOT NULL DEFAULT 0 CHECK (doors_pulls>=0),
 margin_type text NOT NULL DEFAULT '35' CHECK (margin_type IN ('25','35','other')),
 custom_margin numeric(7,5) NOT NULL DEFAULT 0 CHECK (custom_margin>=0 AND custom_margin<1),
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.project_room_financials (
 room_id uuid PRIMARY KEY REFERENCES public.project_rooms(id) ON DELETE CASCADE,
 room_cost numeric(12,2) NOT NULL DEFAULT 0 CHECK(room_cost>=0),
 manufacturer_discount numeric(6,3) NOT NULL DEFAULT 0 CHECK(manufacturer_discount>=0 AND manufacturer_discount<=100),
 updated_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.project_financials IS 'Admin-only project financial data. Authorize at the server boundary before querying.';
COMMENT ON TABLE public.project_room_financials IS 'Admin-only room financial data. Never join into general room list.';
