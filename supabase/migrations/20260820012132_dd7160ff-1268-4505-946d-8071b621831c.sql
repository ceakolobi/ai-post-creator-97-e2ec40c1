INSERT INTO public.plan_checkouts (plano_id, checkout_url, updated_at)
VALUES
  ('essencial', 'https://pay.kiwify.com.br/EDD1rIh', now()),
  ('profissional', 'https://pay.kiwify.com.br/KjyrZMg', now())
ON CONFLICT (plano_id) DO UPDATE
SET checkout_url = EXCLUDED.checkout_url, updated_at = now();