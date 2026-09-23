/** @type {Record<string, Record<string, string>>} */
export const messages = {
  en: {
    help: 'Pubvero CLI — authoring tools\n\n  pubvero init [page.html]    Create a Page without overwriting files\n  pubvero check <page.html>   Run basic authoring diagnostics\n  pubvero doctor --server <https://host/mcp>\n                              Check public OAuth discovery (no login)\n  pubvero skill              Print the bundled skill path\n\nOptions: --locale en|pt_BR, --json, --help, --version\n\nLive local preview and CLI OAuth login are not available yet.\nUse your MCP client and the hosted draft preview for authorized real data.',
    invalid_arguments:
      'Invalid arguments. Run pubvero --help. Never pass credentials as arguments.',
    invalid_server:
      'Use the trusted HTTPS /mcp URL of your instance, without credentials, query or fragment.',
    file_exists:
      'The destination already exists. Choose a new filename; no file was overwritten.',
    file_unreadable: 'Cannot read the file. Check the path and permissions.',
    file_unwritable:
      'Cannot create the file. Check its parent directory and permissions.',
    invalid_file: 'Use a regular HTML file no larger than 2 MiB.',
    created:
      'Page created. Edit the content, run check, then use MCP to create a hosted draft.',
    check_ok:
      'No basic authoring issues detected. This is not a security audit or proof that the Page works. Validate in the hosted preview.',
    check_failed:
      'Review these authoring diagnostics. Source content has not been printed or uploaded.',
    discovery_ok:
      'Public OAuth discovery is valid. This does not verify login, MCP compatibility or data permissions.',
    discovery_failed:
      'Discovery request failed. Check the URL, network and instance availability. Redirects are not followed.',
    invalid_metadata:
      'The instance returned invalid, oversized or mismatched OAuth discovery metadata.',
    unexpected_error:
      'An unexpected error occurred. No source content or remote response was printed.',
    document_structure:
      'Use a complete HTML document with doctype, html, head, title and body.',
    document_language: 'Set the HTML lang attribute for your audience.',
    viewport: 'Include a viewport meta tag for mobile layouts.',
    external_resource:
      'Use self-contained resources; remote scripts and styles will not work in the Page sandbox.',
    direct_network:
      'Use authorized page.query bindings, not direct network calls.',
    runtime_override:
      'Remove local window.page fixtures before uploading the Page.',
    starter_title: 'Your next report',
    starter_body:
      'Replace this content with your report. No data source is connected yet.',
  },
  pt_BR: {
    help: 'Pubvero CLI — ferramentas de autoria\n\n  pubvero init [page.html]    Criar uma página sem sobrescrever arquivos\n  pubvero check <page.html>   Executar diagnósticos básicos de autoria\n  pubvero doctor --server <https://host/mcp>\n                              Verificar descoberta OAuth pública (sem login)\n  pubvero skill              Exibir o caminho da skill incluída\n\nOpções: --locale en|pt_BR, --json, --help, --version\n\nPreview local conectado e login OAuth pelo CLI ainda não estão disponíveis.\nUse seu cliente MCP e o preview hospedado do rascunho para dados reais autorizados.',
    invalid_arguments:
      'Argumentos inválidos. Execute pubvero --help. Nunca passe credenciais como argumentos.',
    invalid_server:
      'Use a URL HTTPS /mcp confiável da sua instância, sem credenciais, query ou fragmento.',
    file_exists:
      'O destino já existe. Escolha outro nome; nenhum arquivo foi sobrescrito.',
    file_unreadable:
      'Não foi possível ler o arquivo. Verifique o caminho e as permissões.',
    file_unwritable:
      'Não foi possível criar o arquivo. Verifique a pasta de destino e as permissões.',
    invalid_file: 'Use um arquivo HTML regular com no máximo 2 MiB.',
    created:
      'Página criada. Edite o conteúdo, execute check e use o MCP para criar um rascunho hospedado.',
    check_ok:
      'Nenhum problema básico de autoria detectado. Isto não é uma auditoria de segurança nem prova de funcionamento. Valide no preview hospedado.',
    check_failed:
      'Revise os diagnósticos de autoria. O conteúdo do arquivo não foi exibido nem enviado.',
    discovery_ok:
      'A descoberta OAuth pública é válida. Isto não verifica login, compatibilidade MCP ou permissões de dados.',
    discovery_failed:
      'A consulta de descoberta falhou. Verifique a URL, a rede e a disponibilidade da instância. Redirecionamentos não são seguidos.',
    invalid_metadata:
      'A instância retornou metadados OAuth inválidos, excessivos ou de outro recurso.',
    unexpected_error:
      'Ocorreu um erro inesperado. Nenhum conteúdo do arquivo ou resposta remota foi exibido.',
    document_structure:
      'Use um documento HTML completo com doctype, html, head, title e body.',
    document_language:
      'Defina o atributo lang do HTML para o público da página.',
    viewport: 'Inclua a meta tag viewport para layouts móveis.',
    external_resource:
      'Use recursos autocontidos; scripts e estilos remotos não funcionam no sandbox da página.',
    direct_network:
      'Use bindings autorizados de page.query, não chamadas diretas de rede.',
    runtime_override:
      'Remova fixtures locais de window.page antes de enviar a página.',
    starter_title: 'Seu próximo relatório',
    starter_body:
      'Substitua este conteúdo pelo seu relatório. Nenhuma fonte de dados está conectada ainda.',
  },
};

/** @param {string | undefined} environmentLocale */
export function detectLocale(environmentLocale) {
  return /^pt(?:[_-]BR)?(?:[.@]|$)/i.test(environmentLocale ?? '')
    ? 'pt_BR'
    : 'en';
}
