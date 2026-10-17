-- Rev-A-Shelf accessories are children of project rooms.
CREATE TABLE public.rev_a_shelf_items (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 room_id uuid NOT NULL REFERENCES public.project_rooms(id) ON DELETE CASCADE,
 item_name text NOT NULL CHECK (length(trim(item_name)) BETWEEN 1 AND 200),
 code text,
 link text,
 sort_order integer NOT NULL DEFAULT 0,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX rev_a_shelf_items_room_order_idx ON public.rev_a_shelf_items(room_id,sort_order,id);
