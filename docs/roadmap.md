# Connected development / Desenvolvimento conectado

## English

Implemented: OAuth/PKCE through the official MCP SDK, automatic loopback callback, authorized context discovery, sandboxed local `dev`, named SQL/HTTP GET binding execution, draft `push`, exact-version `publish`, authoring diagnostics and bundled skill.

Limits and next work:

- Tokens are memory-only. Each command authorizes again; design OS-vault persistence before offering durable login.
- Existing Page and bindings required; use the agent's MCP connection to create them.
- Reload is explicit, not a file watcher.
- OAuth endpoints must share the trusted instance origin; external identity-provider origins are not supported by this client.
- Preview runs on the same workstation as the browser. Remote development/container forwarding needs a separately reviewed flow.
- Real user consent and representative source execution on staging remain manual acceptance checks.
- npm publication requires explicit authorization, scope ownership and release/provenance configuration.

No release date is promised. An authorized workstation receives real results; source credentials remain server-side.

## Português brasileiro

Implementado: OAuth/PKCE pelo SDK MCP oficial, callback loopback automático, descoberta de contexto autorizado, `dev` local isolado, execução de bindings nomeados SQL/HTTP GET, `push` de rascunho, `publish` por versão exata, diagnósticos e skill.

Limites e próximos passos:

- Tokens só em memória. Cada comando autoriza novamente; projetar persistência no cofre do sistema antes de oferecer login durável.
- Página e bindings devem existir; use o MCP do agente para criá-los.
- Recarga explícita, sem observar arquivos automaticamente.
- Endpoints OAuth devem pertencer à mesma origem confiável; o cliente não suporta emissores externos.
- Preview e navegador executam no mesmo computador. Desenvolvimento remoto/containers exige fluxo de encaminhamento revisado separadamente.
- Consentimento real e execução contra fontes representativas no staging continuam como aceite manual.
- Publicação npm exige autorização explícita, controle do escopo e configuração de release/proveniência.

Sem promessa de data. O computador autorizado recebe resultados reais; credenciais das fontes ficam no servidor.
