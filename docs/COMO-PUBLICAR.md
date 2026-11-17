# Como colocar o app no seu próprio site

Leva uns 15 minutos. Você vai criar duas contas (Anthropic e Cloudflare), uma chave e uma senha.
Os nomes dos botões podem mudar um pouco com o tempo; se algo não bater, me pergunte.

## 1. Chave da IA (Anthropic)

1. Entre em **platform.claude.com** e crie uma conta (pode usar o mesmo e-mail do Claude).
2. Em **Billing** (cobrança), adicione crédito. US$ 5 a 10 já dá para muitas noites de jogo.
3. Em **Limits** (limites), coloque um limite de gasto por mês, por exemplo US$ 20.
4. Em **API Keys**, clique em **Create Key**, dê o nome `gabrielle` e copie a chave.
   Ela começa com `sk-ant-`. Guarde num lugar seguro: ela só aparece uma vez.
   **Nunca mande essa chave para ninguém, nem cole no chat.**

## 2. Site (Cloudflare, grátis)

1. Entre em **dash.cloudflare.com** e crie uma conta.
2. Vá em **Workers & Pages** → **Create** → aba **Pages** → **Import an existing Git repository** (conectar ao Git).
3. Conecte sua conta do GitHub e escolha o repositório **Gabihustoria-**.
4. Em **Production branch**, escolha `claude/rpg-social-media-app-z4j8oj`.
5. Em **Build settings**:
   - Framework preset: **None**
   - Build command: `npm run build`
   - Build output directory: `dist`
6. Clique em **Save and Deploy** e espere terminar.

## 3. Chave e senha no site

1. No projeto da Cloudflare, vá em **Settings** → **Variables and Secrets** (variáveis e segredos).
2. Adicione duas, as duas do tipo **Secret** (segredo), em **Production**:
   - `ANTHROPIC_API_KEY` → a chave que você copiou no passo 1.
   - `APP_PASSWORD` → uma senha que você inventar (é a senha do app; quem não souber não consegue usar o seu crédito).
3. Vá em **Deployments** e clique em **Retry deployment** (implantar de novo), para o site pegar a chave.

## 4. No iPhone da Gabi

1. Abra o link do site (algo como `gabrielle-salvatore.pages.dev`) no **Safari**.
2. Na aba **Ficha**, coloque a **senha do app**.
3. Toque em **Compartilhar** → **Adicionar à Tela de Início**. Pronto: vira um ícone como um aplicativo.

## 5. Trazer a história do Claude

1. No app dentro do Claude, vá em **Ficha** → **Baixar backup** e salve o arquivo.
2. No site novo, vá em **Ficha** → **Restaurar backup** e escolha esse arquivo.

## Bom saber

- O progresso fica salvo **no aparelho**. Use **Baixar backup** de vez em quando, para não perder nada se trocar de celular.
- O **Modo econômico** (na Ficha) faz o narrador usar o Sonnet em vez do Opus, que custa metade.
- Para ver quanto gastou: platform.claude.com → **Usage** (uso).
- Quando eu mudar o app no GitHub, o site atualiza sozinho.
