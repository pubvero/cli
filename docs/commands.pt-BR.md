# Referência de comandos

Opções globais: `--locale en|pt_BR`, `--json`, `--help` (`-h`), `--version` (`-v`). Opções desconhecidas falham. Não passe segredos nos argumentos.

| Comando                 | Efeito                                                                                                                                           | Rede                          |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------- |
| `init [path]`           | Cria um HTML; padrão `page.html`. Nunca sobrescreve arquivo ou symlink existente. A pasta de destino deve existir.                               | Nenhuma                       |
| `check <path>`          | Lê um arquivo regular de até 2 MiB; diagnostica HTML, idioma, viewport, recursos externos, chamadas de rede e fixtures sobrescrevendo o runtime. | Nenhuma                       |
| `doctor --server <url>` | Confere metadados públicos da instância HTTPS `/mcp` escolhida. Um GET, timeout de 10 segundos, limite de 64 KiB e sem redirecionamentos.        | Somente a instância escolhida |
| `skill`                 | Exibe o caminho do `SKILL.md` instalado.                                                                                                         | Nenhuma                       |

## Comandos conectados

Todos exigem `--server <https://host/mcp>`. Cada comando inicia sua sessão OAuth e exibe instruções em stderr. Abra o link no computador do CLI. `login` verifica acesso; não persiste login. Tokens ficam em memória; Ctrl+C cancela e encerra os listeners locais.

| Comando                                             | Efeito                                                                                                                                              |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `login`                                             | Verifica OAuth e acesso ao contexto MCP, encerrando a sessão.                                                                                       |
| `context`                                           | Retorna workspaces, páginas e conexões autorizados.                                                                                                 |
| `dev <path> --page <id>`                            | Visualiza HTML local com os bindings de uma página editável existente. Abra a URL loopback exibida e recarregue após editar. Não envia nem publica. |
| `push <path> --page <id>`                           | Chama `update-page`; retorna `version_id` imutável, número da versão e checksum. O backend clona os bindings existentes.                            |
| `publish --page <id> --revision <version_id> --yes` | Publica a versão exata para leitores existentes. `--revision` é o ID da versão, não seu número exibido.                                             |

O navegador não recebe tokens ou credenciais de fontes. Resultados reais chegam ao computador. Bindings executam via `execute-page-binding`, com versão fixada e grants atuais; rascunho alterado exige recarga. `page.viewer()` retorna somente `{ locale }`. SQL e HTTP `{ status, content_type, body }` preservam os formatos hospedados. Respostas HTTP não-2xx chegam ao código da página sem serem ocultadas. Implemente estados de carregamento, vazio e erro.

Prepare a página com `get-context`, `create-page` e ferramentas de binding pelo agente. O CLI não cria conexões, gerencia segredos ou aceita SQL/URLs arbitrários. Endpoints OAuth devem pertencer à origem confiável. Não há observação automática de arquivos, login durável ou encaminhamento de callback remoto/container.

`context`, `push` e `publish` emitem `{ ok: true, result: ... }`. `dev --json` emite `{ ok: true, url, message }` e permanece aberto. `login --json` emite o objeto de status usual. Mantenha URLs OAuth/preview privadas. Não registre recursos sensíveis em CI compartilhada.

Recuperação: `oauth_cancelled` indica cancelamento; `oauth_timeout` exige novo comando/link; `oauth_failed` exige conferir instância/rede; `oauth_untrusted_origin` bloqueia descoberta/autorização fora da origem confiável. Em `remote_failed`, confira grants, versão e servidor. Antes de repetir uma escrita de resultado incerto, inspecione o estado remoto—não repita publicação automaticamente. O limite de upload do backend pode ser menor que o leitor local de 2 MiB (padrão: 524.288 caracteres).

## Diagnóstico não é validação de código não confiável

`check` usa heurísticas textuais. Comentários e exemplos podem gerar falsos positivos; código ofuscado, APIs alternativas e HTML malformado podem escapar. O comando não executa, sanitiza nem envia HTML. Um resultado sem achados não verifica JavaScript, acessibilidade, limites do backend, bindings, permissões ou prontidão para publicação. O limite de 2 MiB protege o leitor local, não representa o limite de upload da plataforma.

Valide a página no preview hospedado do rascunho. Mantenha estados de carregamento, vazio e erro. Use dados reais autorizados; nunca substitua por fixtures silenciosamente após uma falha.

## Resolver falhas

- `invalid_arguments`: consulte `--help`; use opções e idiomas suportados.
- `invalid_server`: use a URL HTTPS canônica confiável terminando em `/mcp`, sem segredos, query ou fragmento.
- `discovery_failed`: verifique conectividade e disponibilidade. Redirecionamentos e falhas HTTP não são aceitos.
- `invalid_metadata`: peça ao administrador para conferir os metadados do recurso protegido. O corpo da resposta não é exibido.
- `file_exists`: escolha outro destino; não existe opção de sobrescrita.
- `file_unreadable`, `file_unwritable`, `invalid_file`: confira permissões, pasta de destino, tipo e tamanho.
- `check_failed`: revise os códigos estáveis dos achados e as explicações localizadas.
- `unexpected_error`: informe comando, versões CLI/Node e reprodução sanitizada. Não anexe tokens ou arquivos confidenciais.

Erros JSON contêm `ok`, `code` e `message` localizada; checks com achados incluem `findings`. `skill --json` retorna `{ "path": "..." }`; `--version --json` retorna `{ "version": "..." }`. No modo JSON, stdout contém apenas JSON. Falhas em texto usam stderr.
