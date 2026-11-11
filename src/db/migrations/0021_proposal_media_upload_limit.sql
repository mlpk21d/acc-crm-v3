ALTER TABLE public.proposal_media
 DROP CONSTRAINT proposal_media_image_data_check,
 ADD CONSTRAINT proposal_media_image_data_check CHECK (octet_length(image_data) BETWEEN 1 AND 10485760);

COMMENT ON TABLE public.proposal_media IS 'Private render images; included in database backups, limited to 10 MiB per proposal by application validation.';
