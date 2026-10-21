-- Extend the existing catalog without altering saved cabinet price snapshots.
ALTER TABLE public.jk_price_items
 ADD COLUMN series text CHECK (series IS NULL OR length(trim(series)) BETWEEN 1 AND 50),
 ADD COLUMN item_code text CHECK (item_code IS NULL OR length(trim(item_code)) BETWEEN 1 AND 150),
 ADD COLUMN tier text CHECK (tier IS NULL OR length(trim(tier)) BETWEEN 1 AND 20),
 ADD COLUMN category text CHECK (category IS NULL OR length(trim(category)) BETWEEN 1 AND 200);
CREATE UNIQUE INDEX jk_price_items_series_item_tier_idx
 ON public.jk_price_items(lower(series),lower(item_code),lower(tier))
 WHERE series IS NOT NULL AND item_code IS NOT NULL AND tier IS NOT NULL;
CREATE INDEX jk_price_items_active_series_idx
 ON public.jk_price_items(lower(series),lower(item_code),lower(tier),id) WHERE active=true;
COMMENT ON COLUMN public.jk_price_items.price IS 'USD price imported from price_usd; saved cabinet unit-price snapshots are independent.';
