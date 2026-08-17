ALTER TABLE public.plan_checkouts ADD COLUMN produto_id text;
CREATE INDEX plan_checkouts_produto_id_idx ON public.plan_checkouts (produto_id);