-- Presentation preference only; the percentage still determines the deposit amount.
ALTER TABLE public.proposals ADD COLUMN show_deposit_percentage boolean NOT NULL DEFAULT true;
