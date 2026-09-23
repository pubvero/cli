# Pubvero Agent Kit

Crie dashboards, relatórios e páginas HTML com um agente e compartilhe pelo Pubvero com acesso controlado ao conteúdo e aos dados.

[English](README.md) · [Comandos](docs/commands.pt-BR.md) · [Segurança](SECURITY.md) · [Contribuição](CONTRIBUTING.md)

## O que funciona hoje

- Skill para criar páginas pela conexão MCP existente.
- OAuth/PKCE, descoberta de recursos e preview local conectado pelo SDK MCP oficial.
- Bindings reais de PostgreSQL e HTTP GET, autorizados pelo backend a cada execução.
- Envio de rascunho e publicação explícita de uma versão imutável exata.

Conectar o MCP não exige este CLI. Ele é um cliente MCP específico para Pubvero, não um executor genérico de ferramentas. Tokens ficam em memória: cada comando conectado autoriza sua própria sessão. Login persistente no cofre do sistema e publicação npm continuam no [plano](docs/roadmap.md).

## Começar pelo código-fonte

Requer Node.js 24+. Sem scripts de instalação, telemetria, tokens persistentes ou alterações globais automáticas.

```sh
git clone https://github.com/pubvero/cli.git
cd cli
npm ci --ignore-scripts
node bin/pubvero.js --help --locale pt_BR
node bin/pubvero.js init page.html --locale pt_BR
node bin/pubvero.js check page.html --locale pt_BR
```

Opcional: `npm link` disponibiliza `pubvero` na instalação atual do Node. Desfaça com `npm unlink --global @pubvero/cli`.

`@pubvero/cli` é o nome pretendido, **não uma instrução de instalação já publicada no npm**. `private: true` bloqueia publicação até autorizar escopo e releases.

## Desenvolver com dados reais

Use a URL confiável da sua instância. Obtenha em `context` o ID de uma página editável; peça ao agente para criar primeiro a página e os bindings aprovados. Substitua os IDs ilustrativos:

```sh
pubvero context --server https://your-instance.example/mcp --locale pt_BR
pubvero dev page.html --page 7 --server https://your-instance.example/mcp --locale pt_BR
# Após revisar, encerre dev com Ctrl+C.
pubvero push page.html --page 7 --server https://your-instance.example/mcp --locale pt_BR
# Use o version_id retornado por push, NÃO o número da versão.
pubvero publish --page 7 --revision 42 --yes --server https://your-instance.example/mcp --locale pt_BR
```

Abra a URL de autorização de cada comando em um navegador **no computador que executa o CLI**. O CLI inicia e encerra o callback temporário automaticamente; não é necessário configurar outro servidor local. Mantenha o terminal aberto. `dev` mostra a URL do preview. Edite o arquivo e use **Recarregar arquivo**; não há observação automática de alterações.

O HTML fica local até `push`. Bindings executam no servidor; os resultados autorizados chegam ao seu computador. Se o rascunho remoto mudar, consultas antigas falham sem trocar de binding silenciosamente. Recarregar atualiza a versão. `push` não publica. `publish --yes` confirma a publicação da versão indicada para quem já tem acesso à página.

`login` verifica OAuth e encerra a sessão; não mantém login para comandos seguintes. A instância precisa expor `get-page-runtime`, `execute-page-binding` e publicação por versão. Use a URL operacional fornecida pelo administrador; registrar `pubvero.io` não significa que a aplicação já esteja publicada nele.

## Usar com seu agente

1. Adicione a URL HTTPS `/mcp` confiável ao cliente MCP e conclua OAuth. Nunca cole credenciais de fontes no agente.
2. Instale a [pasta inteira da skill pubvero-authoring](skills/pubvero-authoring) pelo mecanismo suportado pelo cliente. Preserve `references/`. `pubvero skill` exibe o caminho; não altera configuração do cliente.
3. Peça: “Crie um relatório usando a operação aprovada support-metrics. Mantenha como rascunho, trate carregamento e erros e me dê o link de preview. Não publique ainda.”
4. Inspecione o preview hospedado ou use `dev`. Publique somente quando solicitado. Compartilhar a página não concede acesso às fontes.

## Diagnósticos e idioma

`pubvero doctor --server https://your-instance.example/mcp` verifica descoberta pública, não login ou permissões de consulta. `check` é heurístico, não auditoria de segurança.

Use `--locale en|pt_BR`; sem ele, o idioma segue `LC_ALL`, `LC_MESSAGES` e `LANG`, com inglês para valores não suportados. Conteúdo autoral não é traduzido. `--json` mantém stdout estruturado; instruções OAuth ficam em stderr. Saída 0 significa sucesso; 1 indica achado ou falha.

## Verificar

```sh
npm run verify
npx playwright install chromium
npm run test:e2e
npm audit
npm pack --dry-run
```

Testes cobrem subprocessos, instalação do pacote, OAuth/PKCE pelo SDK oficial contra respostas controladas, segurança do loopback, publicação versionada e Chromium em ambos os idiomas. Permissões do backend têm suíte integrada separada. CI cobre Linux/macOS/Windows em Node 24/26 e Chromium. Isso não comprova consentimento de um usuário real no staging nem execução contra fontes reais de clientes.

Licença MIT. Veja [SECURITY.md](SECURITY.md).
