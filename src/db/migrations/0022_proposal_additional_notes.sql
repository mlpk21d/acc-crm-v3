ALTER TABLE public.proposals
 ADD COLUMN additional_notes text NOT NULL DEFAULT ''
 CHECK (char_length(additional_notes) <= 1000);
