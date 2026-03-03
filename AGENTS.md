# AGENTS.md

## Objetivo
Este projeto atende varios casais. Nenhum dado pessoal real de clientes deve aparecer em conteudo publico, codigo, commits ou logs.

## Regras de Privacidade (Obrigatorias)
- Nunca salvar nomes reais, enderecos reais, telefones, e-mails, numeros de passaporte, numeros A-Number, receipt numbers ou datas pessoais identificaveis em arquivos publicos.
- Sempre anonimizar exemplos usando placeholders:
  - `Beneficiario`
  - `Peticionaria`
  - `Co-patrocinador(a)`
- Nunca incluir historias de casos reais em textos publicos sem anonimizar completamente.

## Onde Salvar Conteudo
- Publico (renderizado pelo app): `src/content/guides/*.md`
- Sensivel/privado (nao versionar): `src/content/private/`
- O diretorio `src/content/private/` deve permanecer ignorado no Git.

## Regras para Edicao de Guias
- Qualquer novo bloco enviado por usuario deve ser tratado como potencialmente sensivel.
- Antes de salvar em `src/content/guides`, remover PII e referencias unicas de pessoa/caso.
- Manter linguagem generica e reutilizavel para qualquer casal.

## Checklist Antes de Finalizar
- Rodar busca por nomes/dados pessoais conhecidos no repositorio.
- Confirmar que arquivos publicos nao contem PII.
- Rodar `npm run lint`.

## Regra de Ouro
Se houver duvida entre utilidade e privacidade, priorizar privacidade.
