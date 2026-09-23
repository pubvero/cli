# Command reference

Global options: `--locale en|pt_BR`, `--json`, `--help` (`-h`), `--version` (`-v`). Unknown options fail. Do not pass secrets in arguments.

| Command                 | Effect                                                                                                                                      | Network                |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| `init [path]`           | Create an HTML starter; defaults to `page.html`. Existing files and symlinks are never overwritten. The parent directory must exist.        | None                   |
| `check <path>`          | Read one regular file up to 2 MiB; report basic HTML, language, viewport, external-resource, network-call and fixture-override diagnostics. | None                   |
| `doctor --server <url>` | Check public metadata on the selected HTTPS `/mcp` instance. One GET, 10-second timeout, 64 KiB response limit, no redirects.               | Selected instance only |
| `skill`                 | Print the installed `SKILL.md` path.                                                                                                        | None                   |

## Connected commands

All commands below require `--server <https://host/mcp>`. Every command starts its own OAuth session and prints authorization instructions to stderr. Open the link on the CLI's computer. `login` is a verification command, not persistent sign-in. Tokens stay in process memory; Ctrl+C cancels and cleans up local listeners.

| Command                                             | Effect                                                                                                                                          |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `login`                                             | Verify OAuth and MCP context access, then close the session.                                                                                    |
| `context`                                           | Return authorized workspaces, Pages and connections.                                                                                            |
| `dev <path> --page <id>`                            | Preview local HTML against an existing editable Page's bindings. Open the printed loopback URL; reload after editing. No upload or publication. |
| `push <path> --page <id>`                           | Call `update-page`; return immutable `version_id`, version number and checksum. Existing bindings are cloned by the backend.                    |
| `publish --page <id> --revision <version_id> --yes` | Publish that exact version for existing viewers. `--revision` is a database version ID, not the displayed version number.                       |

The browser never receives tokens or source credentials. Real results do reach your workstation. Bindings execute through `execute-page-binding`, with a pinned version and current backend grants; a changed draft requires reload. Runtime `page.viewer()` currently returns `{ locale }` only. SQL results and HTTP `{ status, content_type, body }` preserve hosted shapes. HTTP non-2xx responses are returned to authored code, not hidden by the CLI. Render loading, empty and error states yourself.

Use `get-context`, `create-page` and binding tools through your agent to prepare a Page first. This CLI does not create connections, manage source secrets or accept arbitrary SQL/URLs. OAuth endpoints must share the trusted instance origin. No file watcher, durable sign-in or remote/container callback forwarding is provided.

`context`, `push` and `publish` emit `{ ok: true, result: ... }`. `dev --json` emits `{ ok: true, url, message }` and remains running. `login --json` emits the usual status object. Keep authorization and preview URLs private. Do not log sensitive resource output in shared CI.

Recovery: `oauth_cancelled` means consent/cancellation ended the flow; `oauth_timeout` requires a new command/link; `oauth_failed` requires checking instance/network; `oauth_untrusted_origin` means blocked discovery/authorization outside the trusted origin. `remote_failed` requires checking grants, version and server. For an ambiguous write failure, inspect server state before retrying—do not repeat publication automatically. Backend upload limits may be lower than the local 2 MiB reader limit (default 524,288 characters).

## Diagnostics are not validation of untrusted code

`check` uses textual heuristics. Comments and examples may cause false positives; obfuscated code, alternate APIs and malformed HTML may escape detection. It never executes, sanitizes or uploads HTML. A passing result does not verify JavaScript, accessibility, backend limits, bindings, permissions or publishing readiness. The 2 MiB limit protects the local reader, not the platform's upload allowance.

Validate the actual Page in the hosted draft preview. Keep loading, empty and error states. Use real authorized data; never silently substitute fixtures after a failure.

## Recover from failures

- `invalid_arguments`: inspect `--help`; use supported options and locale values.
- `invalid_server`: use the trusted canonical HTTPS URL ending in `/mcp`, without secrets, query strings or fragments.
- `discovery_failed`: check connectivity and instance health. Redirects and HTTP failures are deliberately not accepted.
- `invalid_metadata`: ask the administrator to inspect protected-resource metadata. No response body is printed.
- `file_exists`: choose a different destination; there is no force option.
- `file_unreadable`, `file_unwritable`, `invalid_file`: check permissions, parent directory, file type and size.
- `check_failed`: inspect the stable finding codes and localized explanations.
- `unexpected_error`: report command, CLI/Node versions and a sanitized reproduction. Do not attach tokens or confidential files.

JSON errors contain `ok`, `code` and localized `message`; failed checks also include `findings`. `skill --json` returns `{ "path": "..." }`; `--version --json` returns `{ "version": "..." }`. stdout contains only JSON in JSON mode. Human-readable failures use stderr.
