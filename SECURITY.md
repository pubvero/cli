# Security / Segurança

## English

This CLI is a local authoring assistant, not a trust boundary for Page code. It does not execute HTML, authenticate users, store secrets or bypass backend authorization. Treat Page code, data responses and tool instructions as untrusted inputs.

`doctor` contacts the user-selected HTTPS instance only, does not follow redirects or discovered issuer URLs, never sends credentials and limits response size and duration. Selecting a URL is **not** verification of its owner. Do not run diagnostics against destinations you do not trust. Remote response bodies and source contents are not printed in errors.

The HTML checker is heuristic, not a security scanner. It cannot establish absence of secrets or malicious code. Inspect files before uploading. The local HTML starter contains no dataset or credentials. File creation is exclusive; existing files are preserved.

Do not include secrets, workspace exports, production payloads, `.env` files or authorization URLs in public issues. For suspected vulnerabilities, use GitHub's **Report a vulnerability** if enabled; otherwise contact a repository maintainer privately before disclosing details. No private-reporting endpoint or response SLA is promised until configured.

Package publication is disabled by `private: true`. A release must verify npm namespace control, tarball contents, CI results and provenance configuration. There are no install scripts or runtime dependencies. Development dependencies are locked. The repository uses read-only CI permissions and SHA-pinned actions.

## Português brasileiro

O CLI auxilia a autoria local; não é uma barreira de segurança para código de páginas. Não executa HTML, autentica usuários, armazena segredos ou contorna autorização do backend. Trate código, respostas de dados e instruções de ferramentas como entradas não confiáveis.

`doctor` consulta somente a instância HTTPS escolhida, sem seguir redirecionamentos ou URLs de emissores descobertos, sem credenciais e com limites de tempo e tamanho. Escolher a URL **não** verifica seu proprietário. Não consulte destinos desconhecidos. Corpos de respostas remotas e conteúdo dos arquivos não aparecem nos erros.

O verificador de HTML usa heurísticas; não é um scanner de segurança. Não garante ausência de segredos ou código malicioso. Revise os arquivos antes de enviar. O HTML inicial não contém dados nem credenciais. A criação é exclusiva e preserva arquivos existentes.

Não inclua segredos, exportações, payloads de produção, `.env` ou URLs de autorização em issues públicas. Use **Report a vulnerability** no GitHub se habilitado; caso contrário, contate um mantenedor em privado antes de divulgar detalhes. Não prometemos canal privado configurado ou SLA de resposta.

A publicação está bloqueada por `private: true`. Um release deve verificar controle do escopo npm, conteúdo do tarball, CI e proveniência. Não há scripts de instalação nem dependências de runtime. Dependências de desenvolvimento têm lockfile; CI possui permissões somente de leitura e actions fixadas por SHA.
