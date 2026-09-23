# Connected development / Desenvolvimento conectado

## English

Delivered here: local authoring helpers, public discovery diagnostics and the agent skill for existing hosted MCP workflows.

The next milestone requires an OAuth-authenticated backend contract for executing **Page bindings**, not raw SQL access and not reuse of browser session routes. The backend must recheck tenant, Page, binding author and viewer source grants on every call. This contract is not part of this release.

After that boundary is implemented and tested:

1. Use the current stable official MCP client SDK for discovery, OAuth/PKCE and protocol negotiation. Never implement a parallel protocol just to avoid a dependency.
2. Start and stop an ephemeral loopback callback automatically; validate state, Host, path and request shape, with cancellation and timeout handling.
3. Keep tokens in memory until OS-vault persistence is designed. Never write plaintext tokens to project files or provide tokens to the Page iframe.
4. Run connected preview in a sandbox with per-session channels and source/origin validation. Forward only authorized named bindings. Display workspace and data mode; no implicit fixture fallback or result persistence.
5. Test authorization failures, revoked grants, tenant isolation, missing bindings, network failures, OAuth cancellation and malicious loopback requests. Match hosted runtime response shapes.
6. Enable explicit versioned publication only after its contract and authorization tests exist. Do not automatically retry consequential writes.

No release date or npm availability is promised. Real query results reach an authorized workstation; source credential protection does not mean data never leaves the backend.

## Português brasileiro

Entregue aqui: ferramentas locais de autoria, diagnóstico da descoberta pública e skill para os fluxos MCP hospedados existentes.

O próximo marco exige um contrato de backend autenticado por OAuth para executar **bindings de páginas**, não acesso SQL bruto nem reutilização de rotas de sessão do navegador. Cada execução deve revalidar tenant, página, autor do binding e grants da fonte para o leitor. Esse contrato não faz parte deste release.

Depois de implementar e testar essa fronteira:

1. Usar o SDK MCP oficial estável atual para descoberta, OAuth/PKCE e negociação de protocolo. Não criar protocolo paralelo para evitar dependência.
2. Iniciar e encerrar callback temporário em loopback automaticamente; validar state, Host, caminho e formato, com cancelamento e timeout.
3. Manter tokens em memória até projetar persistência no cofre do sistema. Nunca gravar tokens em texto puro no projeto nem entregá-los ao iframe.
4. Executar preview conectado em sandbox com canal por sessão e validação de origem/remetente. Encaminhar apenas bindings nomeados autorizados. Mostrar workspace e modo de dados; sem fallback implícito nem persistência de resultados.
5. Testar falhas de autorização, grants revogados, isolamento de tenants, bindings ausentes, rede, cancelamento OAuth e requisições maliciosas ao loopback. Manter paridade com as respostas do runtime hospedado.
6. Habilitar publicação explícita e versionada após contrato e testes de autorização. Não repetir automaticamente escritas consequenciais.

Sem promessa de data ou disponibilidade no npm. Resultados reais chegam ao computador autorizado; proteger credenciais da fonte não significa que os dados nunca saem do backend.
