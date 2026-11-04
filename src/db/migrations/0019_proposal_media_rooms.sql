-- Preserve legacy renders without guessing their rooms; require assignment on the next save.
ALTER TABLE public.proposal_media
 ADD COLUMN room_id uuid REFERENCES public.project_rooms(id) ON DELETE RESTRICT,
 ADD COLUMN is_main boolean NOT NULL DEFAULT false;
UPDATE public.proposal_media m SET is_main=true
WHERE m.id IN (SELECT DISTINCT ON (proposal_id) id FROM public.proposal_media ORDER BY proposal_id,sort_order,id);
CREATE UNIQUE INDEX proposal_media_main_idx ON public.proposal_media(proposal_id) WHERE is_main;
CREATE INDEX proposal_media_room_order_idx ON public.proposal_media(proposal_id,room_id,sort_order,id);
CREATE INDEX proposal_media_room_idx ON public.proposal_media(room_id) WHERE room_id IS NOT NULL;
