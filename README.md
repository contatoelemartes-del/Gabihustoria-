# Gabrielle Salvatore

RPG de The Vampire Diaries em que a Gabi cria e interpreta a Gabrielle Salvatore; todos os outros personagens são IA.
Abas: História (modo turnos), Insta, Twitter, DMs e Ficha.

O mesmo `index.html` roda em dois lugares:

- **No Claude** (artifact): usa a IA da conta Claude e salva o progresso na conta.
- **No site próprio** (Cloudflare Pages): usa a API do Claude com a sua chave, por `functions/api/claude.js`, e salva no aparelho.
  Passo a passo em [docs/COMO-PUBLICAR.md](docs/COMO-PUBLICAR.md).

Modelos no site: narrador no Opus 5.5 (ou Sonnet 5.5 no modo econômico), DMs e posts no Sonnet 5.5, respostas curtas no Haiku 5.5.

Para rodar localmente: crie `.dev.vars` com `ANTHROPIC_API_KEY` e `APP_PASSWORD`, depois `npm install && npm run dev`.
