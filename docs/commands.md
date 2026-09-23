# Command reference

Global options: `--locale en|pt_BR`, `--json`, `--help` (`-h`), `--version` (`-v`). Unknown options fail. Do not pass secrets in arguments.

| Command                 | Effect                                                                                                                                      | Network                |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| `init [path]`           | Create an HTML starter; defaults to `page.html`. Existing files and symlinks are never overwritten. The parent directory must exist.        | None                   |
| `check <path>`          | Read one regular file up to 2 MiB; report basic HTML, language, viewport, external-resource, network-call and fixture-override diagnostics. | None                   |
| `doctor --server <url>` | Check public metadata on the selected HTTPS `/mcp` instance. One GET, 10-second timeout, 64 KiB response limit, no redirects.               | Selected instance only |
| `skill`                 | Print the installed `SKILL.md` path.                                                                                                        | None                   |

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
