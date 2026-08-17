CREATE TABLE public.plan_checkouts (
  plano_id text PRIMARY KEY,
  checkout_url text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.plan_checkouts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plan_checkouts TO authenticated;
GRANT ALL ON public.plan_checkouts TO service_role;
ALTER TABLE public.plan_checkouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plan checkouts public read" ON public.plan_checkouts FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "plan checkouts admin manage" ON public.plan_checkouts FOR ALL TO authenticated USING (private.has_role(auth.uid(),'admin'::app_role)) WITH CHECK (private.has_role(auth.uid(),'admin'::app_role));

CREATE TABLE public.pagamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text NOT NULL,
  plano_id text,
  status text NOT NULL,
  evento text,
  order_id text,
  valor numeric,
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX pagamentos_email_idx ON public.pagamentos (lower(email));
GRANT SELECT ON public.pagamentos TO authenticated;
GRANT ALL ON public.pagamentos TO service_role;
ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own pagamentos select" ON public.pagamentos FOR SELECT TO authenticated USING (auth.uid() = user_id OR private.has_role(auth.uid(),'admin'::app_role));