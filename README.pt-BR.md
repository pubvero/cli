# Pubvero Agent Kit

Crie dashboards, relatórios e páginas HTML com um agente e compartilhe pelo Pubvero com acesso controlado ao conteúdo e aos dados.

[English](README.md) · [Comandos](docs/commands.pt-BR.md) · [Segurança](SECURITY.md) · [Contribuição](CONTRIBUTING.md)

## O que funciona hoje

- **Skill para agentes:** criar páginas pela conexão MCP existente, usar bindings autorizados de PostgreSQL ou HTTP GET e publicar quando solicitado.
- **CLI local:** criar um HTML autocontido, executar diagnósticos básicos de autoria, localizar a skill e verificar a descoberta OAuth pública.
- **Dados reais:** usar o preview hospedado do rascunho retornado pelo MCP. O backend verifica permissões da página e das fontes.

Este é um kit inicial de autoria, **não um preview local conectado nem um cliente MCP independente**. Login OAuth pelo CLI, `dev`, execução de bindings e publicação pelo CLI não estão implementados. Conectar o MCP não exige instalar o CLI. Veja o [plano](docs/roadmap.md).

## Começar pelo código-fonte

Requer Node.js 24 ou superior. Sem dependências de runtime, scripts de instalação, telemetria, tokens armazenados ou alterações globais de configuração.

```sh
git clone https://github.com/pubvero/cli.git
cd cli
npm ci --ignore-scripts
node bin/pubvero.js --help --locale pt_BR
node bin/pubvero.js init page.html --locale pt_BR
node bin/pubvero.js check page.html --locale pt_BR
```

Opcional: `npm link` disponibiliza `pubvero` na instalação atual do Node. Desfaça com `npm unlink --global @pubvero/cli`.

`@pubvero/cli` é o nome pretendido, **não uma instrução de instalação já publicada no npm**. O pacote permanece privado para impedir publicação acidental até confirmar controle do escopo e processo de release.

## Usar com seu agente

1. Adicione a URL HTTPS `/mcp` da sua instância confiável a um cliente com suporte a MCP remoto e OAuth. Conclua a autorização nesse cliente. Não cole credenciais das fontes no agente.
2. Adicione a pasta inteira [`skills/pubvero-authoring`](skills/pubvero-authoring) ao local de skills suportado pelo cliente. Preserve `references/`. Cada cliente possui sua forma de instalação; o CLI não reescreve configurações.
3. Peça ao agente para usar `pubvero-authoring`, descobrir workspaces e fontes acessíveis e criar a página. Exemplo:

   > Crie um relatório de suporte no meu workspace usando a operação aprovada support-metrics. Mantenha como rascunho, mostre estados de carregamento e erro e me entregue o link de preview. Não publique ainda.

4. Revise o rascunho hospedado com dados reais. Solicite publicação quando estiver pronto. Compartilhar a página não concede acesso às fontes.

Use `node bin/pubvero.js skill` para localizar a entrada da skill incluída. O comando apenas exibe um caminho; não instala nada. Se o agente não tiver acesso ao caminho, copie a pasta completa pelo mecanismo suportado por ele.

## Diagnosticar sua instância

Substitua o host de exemplo pelo endereço confiável de staging ou produção:

```sh
node bin/pubvero.js doctor --server https://your-instance.example/mcp --locale pt_BR
```

O comando faz um GET sem autenticação ao endpoint público de metadados do recurso protegido. Confere a URL do recurso e os endereços HTTPS dos servidores de autorização. **Não** verifica login, compatibilidade das ferramentas, acesso ao tenant, execução de consultas ou propriedade do servidor. Redirecionamentos são rejeitados; use a URL canônica final. Nenhum dado é enviado a outro serviço.

`pubvero.io` é o domínio registrado do produto; o registro não significa que a aplicação já esteja publicada nele. Use a URL operacional fornecida pelo administrador do workspace.

## Idioma e automação

Use `--locale en` ou `--locale pt_BR`. Sem opção explícita, a preferência vem de `LC_ALL`, `LC_MESSAGES` e `LANG`, nessa ordem; idiomas de ambiente não suportados usam inglês. O HTML gerado usa o idioma escolhido. Conteúdo criado pelo usuário não é traduzido automaticamente.

`--json` gera saída para automação. Os códigos de diagnóstico não mudam por idioma. Saída `0` significa que o diagnóstico solicitado passou; `1` indica achado ou falha. Nenhum resultado é certificação de segurança.

## Verificar e contribuir

```sh
npm run verify
npm audit
npm pack --dry-run
```

Os testes cobrem subprocessos reais do CLI, arquivos temporários, respostas simuladas de descoberta e instalação do tarball. O CI está configurado para Linux, macOS e Windows com Node 24 e 26; a configuração não significa que todas as execuções remotas já passaram.

Licença MIT. Limitações e relato responsável em [SECURITY.md](SECURITY.md).
