# Dependencies / Dependências

Verified against official registries/docs on 2026-09-23. / Verificado em registros e documentação oficiais em 23/09/2026.

| Dependency                     | Version | Role                                                                           |
| ------------------------------ | ------- | ------------------------------------------------------------------------------ |
| `@modelcontextprotocol/client` | 2.1.0   | Runtime: official OAuth/PKCE and MCP client / cliente oficial OAuth/PKCE e MCP |
| `prettier`                     | 3.9.9   | Development: formatting / formatação                                           |
| `typescript`                   | 7.0.2   | Development: strict JS checking / tipagem estrita                              |
| `@types/node`                  | 26.6.2  | Development: Node types / tipos do Node                                        |
| `playwright`                   | 1.63.0  | Development: Chromium integration tests / testes integrados no Chromium        |

Node 24+; CI also tests Node 26. No runtime build or install hooks. Native Node APIs handle files, loopback servers and tests. The official MCP SDK owns protocol negotiation and OAuth instead of a parallel implementation. Playwright is development-only and uses Node's existing test runner.

Node 24+; CI também testa Node 26. Sem build de runtime nem hooks de instalação. APIs nativas cobrem arquivos, servidores loopback e testes. O SDK oficial implementa negociação de protocolo e OAuth. Playwright é somente de desenvolvimento e usa o runner de testes já existente do Node.

Official references / Referências oficiais:

- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP client npm registry](https://www.npmjs.com/package/@modelcontextprotocol/client)
- [Node HTTP](https://nodejs.org/api/http.html)
- [Node files](https://nodejs.org/api/fs.html)
- [Node test runner](https://nodejs.org/api/test.html)
- [Playwright library](https://playwright.dev/docs/library)
- [Playwright 1.63 release](https://github.com/microsoft/playwright/releases/tag/v1.63.0)
- [iframe sandbox](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe)
- [postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)
- [CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy)
- [Agent Skills specification](https://agentskills.io/specification)
