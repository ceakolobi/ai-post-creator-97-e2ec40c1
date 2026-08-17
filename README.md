# Insta Creator Suite

PROMPT PARA O LOVABLE — Hagoth (SaaS de geração de posts para Instagram com IA)

Construa uma aplicação web completa chamada Hagoth. É um SaaS onde o usuário descreve seu nicho e recebe posts prontos para Instagram (legenda + hashtags + imagem gerada por IA), com histórico, área do cliente e painel administrativo.

O "motor" de geração já existe fora do app: é um workflow n8n exposto por webhook. O Hagoth não gera conteúdo por conta própria — ele coleta os dados do usuário, chama o webhook, e exibe/salva o resultado.

1. STACK E INFRAESTRUTURA

React + TypeScript + Tailwind CSS

Supabase para autenticação, banco de dados e storage

Autenticação por e-mail/senha (com confirmação de e-mail)

Todas as tabelas com Row Level Security (RLS) ativa — cada usuário só acessa os próprios dados

Variáveis de ambiente para a URL do webhook n8n (VITE_N8N_WEBHOOK_URL) — nunca hardcoded no código

2. IDENTIDADE VISUAL

Nome: Hagoth Posicionamento: ferramenta de IA criativa, moderna, para pequenos negócios e criadores de conteúdo. Deve transmitir criatividade + tecnologia, sem parecer amadora.

Paleta (dark mode como padrão, com toggle para light):

Fundo principal: #0B0B12 (quase preto, levemente azulado)

Superfícies/cards: #14141F

Borda sutil: #232333

Cor primária (ações, botões, destaques): gradiente violeta → fúcsia (#7C3AED → #D946EF)

Cor secundária/acento: ciano elétrico #22D3EE (para métricas positivas e badges)

Texto principal: #F4F4F5 | Texto secundário: #A1A1AA

Sucesso #10B981 | Alerta #F59E0B | Erro #EF4444

Diretrizes de design:

Tipografia sem serifa moderna (Inter, Geist ou similar); títulos com peso 600–700

Cantos arredondados generosos (rounded-xl / rounded-2xl)

Uso sutil de glassmorphism e glow nos elementos primários — sem exagero

Micro-animações em hover e transições de estado (framer-motion se disponível)

Estados de loading com skeleton, nunca tela branca travada

Mobile-first: tudo precisa funcionar bem no celular (muitos usuários vão gerar posts pelo telefone)

3. ESTRUTURA DE PÁGINAS

3.1 Landing page pública (/)

Hero: headline forte ("Posts profissionais para Instagram em segundos"), subtítulo, CTA "Começar grátis"

Seção de benefícios (3–4 cards com ícone): geração de legenda + hashtags, imagem exclusiva por IA, histórico organizado, feito para quem não é designer

Seção "Como funciona" em 3 passos: descreva seu nicho → a IA cria → copie e publique

Prova social (placeholder para depoimentos futuros)

Seção de planos (ver item 7)

Rodapé com links legais (Termos de Uso, Política de Privacidade — criar páginas simples)

3.2 Autenticação

/login — e-mail e senha, link "esqueci minha senha"

/criar-conta — nome completo, e-mail, telefone/WhatsApp, nome do negócio/marca (opcional), senha

Na lateral (ou acima no mobile), exibir descrição do produto: o que o Hagoth faz, o que está incluso, e destaque do teste grátis

/recuperar-senha — fluxo padrão do Supabase

3.3 Dashboard do cliente (/dashboard) — página inicial após login

Grid de cards de métricas no topo:

Posts gerados (total)

Posts este mês

Posts restantes no plano (limite do plano menos consumo do mês)

Dias restantes do teste grátis (se estiver em trial)

Abaixo:

Botão grande e destacado: "Criar novo post"

Gráfico de linha: posts gerados por dia nos últimos 30 dias (usar recharts)

Gráfico de rosca: distribuição dos posts por nicho

Lista dos 5 posts mais recentes, com miniatura da imagem, título curto e data

3.4 Gerador de post (/criar)

Formulário com:

Nicho / segmento (obrigatório, texto) — ex: "clínica de estética"

Palavras-chave (obrigatório, texto) — ex: "harmonização facial, autoestima"

Tom de voz (select, opcional): Profissional · Descontraído · Inspirador · Direto ao ponto · Divertido

Cores da marca (opcional, texto ou color picker duplo)

Formato (select): Post único · Carrossel (carrossel pode ficar desabilitado com selo "em breve")

Ao enviar:

Validar campos obrigatórios no frontend antes de chamar a API

Exibir estado de carregamento com mensagens que rotacionam ("Escrevendo sua legenda...", "Criando a imagem...", "Quase lá...") — a geração leva de 20 a 60 segundos, o usuário não pode achar que travou

Fazer POST para o webhook n8n (VITE_N8N_WEBHOOK_URL) com este corpo:

{
  "nicho": "...",
  "palavras_chave": "...",
  "tom_de_voz": "...",
  "cores_marca": "...",
  "formato": "post único",
  "user_id": "<uuid do usuário logado>"
}


Resposta esperada do webhook:

{
  "sucesso": true,
  "titulo_curto": "...",
  "legenda": "...",
  "hashtags": ["#a", "#b"],
  "imagem_url": "https://...",
  "nicho": "..."
}


Em caso de erro (sucesso: false ou falha de rede), mostrar mensagem clara e manter os dados do formulário preenchidos para o usuário tentar de novo — nunca perder o que ele digitou

Definir timeout de 120 segundos na requisição

Tela de resultado (pode ser na mesma página, abaixo do formulário, ou em /post/:id):

Preview no formato de post do Instagram (imagem quadrada + legenda abaixo), simulando o feed real

Botão "Copiar legenda" (legenda + hashtags juntas) com confirmação visual

Botão "Baixar imagem"

Botão "Gerar outra versão" (reenvia o mesmo formulário)

Botão "Salvar nos favoritos"

3.5 Histórico / Meus posts (/meus-posts)

Grid de cards com miniatura, título curto, nicho e data

Busca por texto (nicho, título ou legenda)

Filtros: por nicho, por período, apenas favoritos

Clicar no card abre o post completo (mesma tela de resultado)

Ações por post: copiar legenda, baixar imagem, favoritar, excluir (com confirmação)

3.6 Minha conta (/minha-conta)

Dados do perfil editáveis: nome, telefone, nome do negócio, foto de avatar (upload para Supabase Storage)

Plano atual, status da assinatura e dias restantes do teste

Consumo do mês: barra de progresso mostrando posts usados x limite do plano

Botão para alterar senha

Seção "Sugestões e Críticas": campo de texto livre + botão enviar, gravando na tabela feedback. Após enviar, exibir confirmação e listar os feedbacks anteriores do próprio usuário

3.7 Área administrativa (/admin) — visível apenas para usuários com papel admin

Visão geral: total de usuários, usuários ativos no mês, total de posts gerados, posts gerados hoje, taxa de conversão de trial para pago

Clientes: tabela com nome, e-mail, telefone, plano, status (trial/ativo/cancelado), data de cadastro, quantidade de posts gerados. Com busca, filtro por status e ordenação

Detalhe do cliente: ao clicar, abrir os dados completos e o histórico de posts daquele cliente

Feedbacks: lista de todas as sugestões e críticas recebidas, com nome/e-mail do autor, mensagem, data e status (novo/lido) e botão para marcar como lido

Gráficos: novos cadastros por dia (últimos 30 dias) e posts gerados por dia (últimos 30 dias)

4. BANCO DE DADOS (Supabase)

Criar as tabelas abaixo, todas com RLS ativa.

profiles

coluna tipo observação id uuid PK, referencia auth.users(id) nome text email text telefone text nome_negocio text nullable avatar_url text nullable role text default 'cliente' — valores: cliente, admin created_at timestamptz default now()

RLS: usuário lê e edita apenas o próprio registro (auth.uid() = id); admin lê todos.

posts_gerados

coluna tipo observação id uuid PK, default gen_random_uuid() user_id uuid referencia auth.users(id), obrigatório nicho text obrigatório palavras_chave text titulo_curto text legenda text obrigatório hashtags text string única separada por espaço prompt_imagem text imagem_url text formato text default 'post único' tom_de_voz text favorito boolean default false created_at timestamptz default now()

RLS: usuário só vê, cria, edita e apaga os próprios posts (auth.uid() = user_id); admin lê todos. Índices: em user_id e em created_at desc.

Importante: o workflow n8n grava diretamente nesta tabela usando a service role key. As policies precisam permitir isso (a service role ignora RLS por padrão — apenas garanta que o user_id enviado pelo app seja gravado corretamente).

subscriptions

coluna tipo observação user_id uuid PK, referencia auth.users(id) status text trial, ativo, cancelado, expirado — default 'trial' trial_started_at timestamptz default now() trial_days integer default 7 plano_ativo text nullable updated_at timestamptz default now()

RLS: usuário lê apenas a própria; admin lê e edita todas.

feedback

coluna tipo observação id uuid PK, default gen_random_uuid() user_id uuid referencia auth.users(id) mensagem text obrigatório status text default 'novo' — valores: novo, lido created_at timestamptz default now()

RLS: usuário cria e lê apenas os próprios; admin lê todos e atualiza o status.

Trigger de cadastro

Ao criar um usuário em auth.users, criar automaticamente:

Um registro em profiles com os dados do metadata do cadastro e role = 'cliente'

Um registro em subscriptions com status = 'trial', trial_started_at = now() e trial_days = 7

Storage

Bucket público avatars para fotos de perfil

Bucket público posts-instagram para as imagens geradas (o n8n grava aqui; o app apenas lê)

5. CONTROLE DE ACESSO E LIMITES

Usuário em trial expirado (mais de 7 dias desde trial_started_at, sem plano ativo) não pode gerar novos posts — ao tentar, exibir modal convidando a assinar, mas continuar com acesso de leitura ao histórico já gerado

Exibir banner fixo no topo do dashboard durante o trial: "Você tem X dias restantes no seu teste grátis"

Aplicar o limite mensal de posts conforme o plano (ver item 7): bloquear geração ao atingir o limite e mostrar quanto falta para renovar

Rotas administrativas protegidas: verificar profiles.role = 'admin' no carregamento; redirecionar quem não for admin

6. TRATAMENTO DE ERROS E EXPERIÊNCIA

Toda chamada ao webhook deve ter tratamento de erro visível ao usuário, com linguagem simples (nada de "500 Internal Server Error")

Se a geração falhar, não descontar do limite mensal do usuário

Skeletons em todas as listas e gráficos durante o carregamento

Estados vazios bem desenhados: "Você ainda não criou nenhum post" com botão de ação, em vez de tela em branco

Toasts de confirmação em ações (copiar, salvar, excluir, enviar feedback)

Confirmação obrigatória antes de excluir qualquer coisa

7. PLANOS (exibição na landing e na página de conta)

Criar a estrutura visual dos planos abaixo. Não implementar cobrança agora — os botões devem apenas registrar o interesse ou abrir um placeholder; a integração de pagamento será feita depois.

Plano Limite mensal Público Teste grátis 10 posts / 7 dias Todos os novos cadastros Essencial 30 posts/mês Autônomos e pequenos negócios Profissional 100 posts/mês Negócios com presença ativa Agência Ilimitado Agências e gestores de várias contas

8. O QUE NÃO FAZER

Não implementar geração de conteúdo dentro do app (chamadas diretas a OpenAI/DALL-E) — toda geração passa pelo webhook n8n

Não implementar publicação automática no Instagram nesta versão (fica para uma fase futura)

Não implementar gateway de pagamento agora

Não deixar nenhuma tabela sem RLS

Não expor chaves de API ou service role key no frontend

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4ba77c3c-d594-46bf-b295-e7e7a65e68f3).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
