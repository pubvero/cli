# Dependencies / Dependências

No runtime dependencies. Node.js standard APIs cover argument parsing, bounded file access, HTTPS discovery and tests. The SDK is intentionally not installed: this release does not implement an MCP client. When adding authenticated commands, use the official stable MCP SDK rather than hand-written protocol code.

Sem dependências de runtime. APIs nativas do Node cobrem argumentos, leitura limitada, descoberta HTTPS e testes. O SDK não foi instalado porque este release não implementa cliente MCP. Ao adicionar comandos autenticados, use o SDK MCP oficial estável, não protocolo manual.

Verified in the npm registry on 2026-09-23 / Verificado no registro npm em 23/09/2026:

| Development dependency | Version | Purpose / Finalidade                            |
| ---------------------- | ------- | ----------------------------------------------- |
| `prettier`             | 3.9.9   | Formatting / Formatação                         |
| `typescript`           | 7.0.2   | Strict JS type checking / Tipagem estrita do JS |
| `@types/node`          | 26.6.2  | Node type definitions / Tipos do Node           |

Node 24 is the supported minimum, Node 26 is also tested in CI. Type definitions are current; the runtime test matrix protects minimum-version compatibility.

Node 24 é o mínimo suportado, com Node 26 também na matriz de CI. Tipos são atuais; testes de runtime protegem compatibilidade com a versão mínima.

Official references / Referências oficiais:

- https://nodejs.org/api/util.html#utilparseargsconfig
- https://nodejs.org/api/test.html
- https://nodejs.org/api/fs.html
- https://nodejs.org/en/about/previous-releases
- https://docs.npmjs.com/cli/v11/configuring-npm/package-json/
- https://www.typescriptlang.org/tsconfig/checkJs.html
- https://prettier.io/docs/cli
- https://agentskills.io/specification
- https://github.com/modelcontextprotocol/typescript-sdk
