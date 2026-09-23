# Security / Segurança

## English

The CLI authenticates with OAuth/PKCE using the official SDK. Tokens, refresh tokens and registered client details remain in process memory and are cleared on shutdown. They never enter the Page, browser storage or project files. Each command authorizes again. OAuth endpoints must share the selected HTTPS instance origin; redirects and credential-bearing URLs are rejected.

The callback binds only to 127.0.0.1 on an ephemeral port, uses an unpredictable path, validates state/Host/method and expires after three minutes. Open authorization on the same workstation. Source credentials are never requested.

Local preview executes untrusted HTML in an opaque-origin sandbox with direct network access disabled. The parent checks the message sender and per-session channel. The loopback server checks Host and exact Origin on POST, limits request bodies to 64 KiB and concurrency/snapshots to eight. Only named bindings from the selected Page version can execute. The backend rechecks tenant, Page and source grants for viewer and binding author. Changed versions fail explicitly. No query-result cache or fixture fallback is provided.

Authorized data reaches the workstation and iframe. Sandbox controls do not protect against malware, a malicious browser extension or another local process. Do not expose/forward the preview port or share its capability URL. The author-controlled Page owns rendering of its loading/error states.

`push` uploads a new draft; `publish` requires an exact version ID and `--yes`. No automatic retry of consequential writes is implemented by the CLI. If a write fails ambiguously, inspect server state before repeating it.

`doctor` performs bounded public discovery only. `check` is heuristic, not sanitization or a security certification; inspect HTML before uploading. Creation never overwrites existing files.

Do not attach tokens, authorization/preview URLs, exports, payloads or .env files to public issues. Use GitHub's **Report a vulnerability** if enabled, otherwise contact a maintainer privately. No private-reporting setup or response SLA is promised.

npm publication remains blocked with `private: true`. Lockfiles, read-only CI permissions and SHA-pinned actions are committed. There are no install hooks or telemetry.

## Português brasileiro

O CLI autentica com OAuth/PKCE pelo SDK oficial. Tokens, refresh tokens e registro do cliente ficam na memória do processo e são descartados no encerramento. Não chegam à página, armazenamento do navegador ou arquivos do projeto. Cada comando autoriza novamente. Endpoints OAuth devem pertencer à origem HTTPS escolhida; redirects e URLs com credenciais são recusados.

O callback escuta somente em 127.0.0.1, com porta temporária, caminho imprevisível, validação de state/Host/método e expiração em três minutos. Abra a autorização no mesmo computador. Credenciais das fontes nunca são solicitadas.

O preview executa HTML não confiável em sandbox de origem opaca, sem rede direta. O pai verifica a janela remetente e o canal da sessão. O servidor loopback verifica Host e Origin exata nos POSTs, limita corpos a 64 KiB e concorrência/snapshots a oito. Somente bindings nomeados da versão selecionada executam. O backend revalida tenant, página e grants de fonte do leitor e do autor do binding. Mudanças de versão falham explicitamente. Não há cache de resultados nem fallback para fixtures.

Dados autorizados chegam ao computador e iframe. O sandbox não protege contra malware, extensões maliciosas ou outros processos locais. Não exponha/encaminhe a porta nem compartilhe a URL privada do preview. A página autoral controla seus estados de carregamento e erro.

`push` envia rascunho; `publish` exige ID exato de versão e `--yes`. O CLI não repete escritas automaticamente. Se o resultado de uma escrita for incerto, confira o estado no servidor antes de repetir.

`doctor` só verifica descoberta pública com limites. `check` é heurístico, não sanitização ou certificação; revise HTML antes de enviar. A criação preserva arquivos existentes.

Não anexe tokens, URLs OAuth/preview, exportações, payloads ou .env a issues públicas. Use **Report a vulnerability** se habilitado; caso contrário, contate um mantenedor em privado. Não prometemos configuração de canal privado ou SLA.

A publicação npm segue bloqueada por `private: true`. Lockfiles, CI somente leitura e actions por SHA estão versionados. Não há hooks de instalação ou telemetria.
