ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS logo_posicao text NOT NULL DEFAULT 'inferior-direita',
  ADD COLUMN IF NOT EXISTS logo_tamanho integer NOT NULL DEFAULT 18,
  ADD COLUMN IF NOT EXISTS logo_opacidade integer NOT NULL DEFAULT 90;