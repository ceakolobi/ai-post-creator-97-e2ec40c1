CREATE TABLE public.agendamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id uuid NOT NULL REFERENCES public.posts_gerados(id) ON DELETE CASCADE,
  rede text NOT NULL DEFAULT 'instagram',
  agendado_para timestamptz NOT NULL,
  observacao text,
  concluido boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.agendamentos TO authenticated;
GRANT ALL ON public.agendamentos TO service_role;

ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own agendamentos select" ON public.agendamentos
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "own agendamentos insert" ON public.agendamentos
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "own agendamentos update" ON public.agendamentos
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "own agendamentos delete" ON public.agendamentos
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX agendamentos_user_data_idx ON public.agendamentos (user_id, agendado_para);