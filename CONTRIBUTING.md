# Contributing / Contribuição

## English

Use Node.js 24+ and `npm ci --ignore-scripts`. Run `npm run verify` before opening a pull request. Write a failing behavioral test first; implement the smallest change; refactor with tests passing. Tests use Node's built-in runner. Formatting uses Prettier; strict `checkJs` uses TypeScript without a runtime build step.

Keep code, tests and machine codes in English. User-facing messages and user guides require `en`/`pt_BR` parity. Add behavior tests, not assertions that merely copy implementation text. Document actual capabilities and limitations. Never introduce implicit network access, publishing, source mutation, fixture fallback or secret storage.

Only curated public files belong here. Never import application history, configuration, customer data or private infrastructure documentation. Inspect `npm pack --dry-run` before changing package contents. This is a pre-production toolkit; no public API stability commitment is implied.

Do not publish npm packages or cut a release from a contribution. Maintainers must explicitly authorize releases after namespace and provenance setup. MIT license applies to contributions.

## Português brasileiro

Use Node.js 24+ e `npm ci --ignore-scripts`. Execute `npm run verify` antes de abrir um PR. Primeiro escreva um teste comportamental que falhe; implemente a menor mudança; refatore com testes verdes. Os testes usam o runner nativo do Node. Prettier formata; TypeScript com `checkJs` estrito verifica tipos sem build de runtime.

Código, testes e códigos de máquina ficam em inglês. Mensagens e guias precisam de paridade `en`/`pt_BR`. Teste comportamento, não apenas textos copiados da implementação. Documente capacidades reais e limitações. Não introduza acesso à rede, publicação, alteração de fontes, fallback de fixtures ou armazenamento de segredos implicitamente.

Somente arquivos públicos selecionados pertencem aqui. Nunca importe histórico da aplicação, configurações, dados de clientes ou documentação privada de infraestrutura. Confira `npm pack --dry-run` ao alterar o conteúdo distribuído. O kit está em pré-produção, sem compromisso de estabilidade de API pública.

Não publique pacotes npm nem crie releases como parte de uma contribuição. Mantenedores precisam autorizar após configurar escopo e proveniência. Contribuições seguem a licença MIT.
