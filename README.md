# PaperPair (Next.js)

Legal paperwork | conjoint filing

Projeto web para apoio ao processo de Adjustment of Status via casamento, com área pública e painel administrativo protegido.

## Stack

- Next.js 14 (App Router)
- Tailwind CSS
- NextAuth (Credentials)
- Prisma + SQLite
- Google Gemini API (user-provided key)
- pdf-lib

## Rotas

- `/` Home
- `/chat` Chat principal
- `/contato` Suporte
- `/guia` Guias públicos (conteúdo educacional para casais)
- `/admin/login` Login restrito
- `/admin/dashboard` Dashboard privado
- `/admin/cms` Edição de páginas públicas
- `/admin/documentos` Upload e gestão de PDFs

## Configuração

1. Copie o arquivo de ambiente:

```bash
cp .env.example .env
```

2. Preencha `.env` com:

- `ADMIN_ALLOWED_EMAIL` (e-mail oficial da Skale Club)
- `ADMIN_PASSWORD`
- `NEXTAUTH_SECRET`
- `DATABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (apenas para rotas administrativas)
- `AI_KEYS_ENCRYPTION_SECRET` (segredo para criptografar chaves Gemini por usuário)

Para usar IA no chat, cada usuario conecta sua propria chave Google AI em `/dashboard/settings`.
A chave é criptografada no servidor e salva de forma privada no Supabase.

3. Instale dependências:

```bash
npm install
```

4. Gere o cliente Prisma e inicialize o banco SQLite:

```bash
npm run prisma:generate
npm run db:init
```

5. Rode em localhost:

```bash
npm run dev
```

## Fluxo resumido

- Admin sobe templates PDF em `/admin/documentos`.
- Usuário conversa no `/chat`.
- Backend extrai JSON estruturado.
- Ao pedir "gerar pdf", o sistema preenche os templates usando `pdf-lib` e gera arquivos em `public/generated`.
- Guias públicos ficam em `src/content/guides/*.md` e são exibidos em `/guia`.

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
