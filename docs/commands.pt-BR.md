# Referência de comandos

Opções globais: `--locale en|pt_BR`, `--json`, `--help` (`-h`), `--version` (`-v`). Opções desconhecidas falham. Não passe segredos nos argumentos.

| Comando                 | Efeito                                                                                                                                           | Rede                          |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------- |
| `init [path]`           | Cria um HTML; padrão `page.html`. Nunca sobrescreve arquivo ou symlink existente. A pasta de destino deve existir.                               | Nenhuma                       |
| `check <path>`          | Lê um arquivo regular de até 2 MiB; diagnostica HTML, idioma, viewport, recursos externos, chamadas de rede e fixtures sobrescrevendo o runtime. | Nenhuma                       |
| `doctor --server <url>` | Confere metadados públicos da instância HTTPS `/mcp` escolhida. Um GET, timeout de 10 segundos, limite de 64 KiB e sem redirecionamentos.        | Somente a instância escolhida |
| `skill`                 | Exibe o caminho do `SKILL.md` instalado.                                                                                                         | Nenhuma                       |

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
