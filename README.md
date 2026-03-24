# PaperPair (Next.js)

Legal paperwork | conjoint filing

Projeto web para apoio ao processo de Adjustment of Status via casamento, com área pública e painel administrativo protegido.

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase Auth (Email/OAuth + Passkeys)
- Prisma + PostgreSQL (Supabase)
- Google Gemini API (user-provided key)
- pdf-lib / pdfjs-dist (PDF generation and preview)
- @simplewebauthn (WebAuthn/Passkeys)

## Rotas

- `/` Home
- `/documentation-filling` Chat principal (coleta de dados)
- `/contact` Suporte
- `/guide` Guias públicos (conteúdo educacional para casais)
- `/dashboard` Painel do usuário (progresso do caso)
- `/login` Login
- `/signup` Cadastro
- `/admin/login` Login restrito
- `/admin/dashboard` Dashboard privado
- `/admin/cms` Edição de páginas públicas
- `/admin/documents` Upload e gestão de PDFs

## Configuração

1. Copie o arquivo de ambiente:

```bash
cp .env.example .env
```

2. Preencha `.env` com:

- `DATABASE_URL` - PostgreSQL connection string
- `POSTGRES_PRISMA_URL` - Prisma connection URL (pooled)
- `POSTGRES_URL_NON_POOLING` - Direct PostgreSQL URL
- `NEXT_PUBLIC_SUPABASE_URL` - URL do projeto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Chave anônima do Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Chave de serviço (apenas rotas admin)
- `AI_KEYS_ENCRYPTION_SECRET` - Segredo para criptografar chaves Gemini por usuário

Para usar IA no chat, cada usuario conecta sua propria chave Google AI em `/dashboard/settings`.
A chave é criptografada no servidor e salva de forma privada no Supabase.

3. Instale dependências:

```bash
npm install
```

4. Configure o banco de dados:

```bash
npm run prisma:generate
npx prisma db push
```

5. Rode em localhost:

```bash
npm run dev
```

## Fluxo resumido

- Admin sobe templates PDF em `/admin/documents`.
- Usuário conversa no `/documentation-filling`.
- Backend extrai JSON estruturado via Google Gemini API.
- Ao pedir "gerar pdf", o sistema preenche os templates usando `pdf-lib`.
- PDFs gerados ficam disponíveis em `/dashboard/my-forms`.
- Guias públicos ficam em `src/content/guides/*.md` e são exibidos em `/guide`.

## Privacidade

- Não coloque dados pessoais reais em `src/content/guides`, pois esse conteúdo é público no app.
- Para anotações sensíveis, use `src/content/private/` (já ignorado pelo Git via `.gitignore`).

## Proteção para GitHub

- Rode antes de commitar:

```bash
npm run privacy:check
```

- Instale o hook local de pre-commit (uma vez):

```bash
npm run hooks:install
```

- O repositório também executa validação automática no GitHub Actions (`privacy-check.yml`) em push e pull request.
