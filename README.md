# Pubvero Agent Kit

Create dashboards, reports and HTML Pages with an agent, then share them through Pubvero with controlled access to content and data.

[Português brasileiro](README.pt-BR.md) · [Commands](docs/commands.md) · [Security](SECURITY.md) · [Contributing](CONTRIBUTING.md)

## What works today

- Agent skill for creating Pages through your existing Pubvero MCP connection.
- OAuth/PKCE, resource discovery and connected local preview through the official MCP client SDK.
- Real PostgreSQL and HTTP GET bindings, authorized by the backend on every execution.
- Draft upload and explicit publication of an exact immutable version.

The MCP connection does not require this CLI. This is a purpose-built MCP client for Pubvero, not a generic tool runner. Tokens remain in memory: each connected command authorizes its own session. Persistent OS-vault login and npm publication remain on the [roadmap](docs/roadmap.md).

## Start from source

Requires Node.js 24+. No install hooks, telemetry, persistent tokens or automatic global configuration changes.

```sh
git clone https://github.com/pubvero/cli.git
cd cli
npm ci --ignore-scripts
node bin/pubvero.js --help
node bin/pubvero.js init page.html
node bin/pubvero.js check page.html
```

Optional: `npm link` makes `pubvero` available in your current Node installation. Undo with `npm unlink --global @pubvero/cli`.

`@pubvero/cli` is the intended package name, **not a published npm installation instruction**. Publication is blocked by `private: true` until registry ownership and releases are authorized.

## Develop with real data

Use your trusted instance URL. Obtain an editable Page ID from `context`; ask your agent to create the Page and approved bindings first. Replace these illustrative IDs:

```sh
pubvero context --server https://your-instance.example/mcp
pubvero dev page.html --page 7 --server https://your-instance.example/mcp
# After reviewing, stop dev with Ctrl+C.
pubvero push page.html --page 7 --server https://your-instance.example/mcp
# Use the version_id returned by push, NOT its version number.
pubvero publish --page 7 --revision 42 --yes --server https://your-instance.example/mcp
```

Open each command's authorization URL in a browser **on the computer running the CLI**. The CLI starts and closes the temporary callback automatically; no separate local server setup is needed. Keep the terminal running. `dev` then prints the local preview URL. Edit your file and select **Reload file**; there is no automatic file watcher.

HTML stays local until `push`. Bindings execute on the server; authorized results reach your computer. A changed remote draft makes old queries fail instead of silently changing bindings. Reload refreshes the version. `push` does not publish. `publish --yes` confirms publication of the specified version to existing Page viewers.

`login` verifies OAuth and closes the session; it does not persist login for later commands. The instance must expose `get-page-runtime`, `execute-page-binding` and version-aware publication. Use the operational URL supplied by your administrator; registration of `pubvero.io` does not alone mean the application is deployed there.

## Use with your agent

1. Add the trusted HTTPS `/mcp` URL to your MCP client and complete its OAuth flow. Never paste source credentials into the agent.
2. Install the complete [pubvero-authoring skill directory](skills/pubvero-authoring) using your client's supported mechanism. Preserve `references/`. `pubvero skill` prints its location; it does not change client configuration.
3. Ask: “Create a support report using the approved support-metrics operation. Keep it as a draft, handle loading and errors, and give me the preview URL. Do not publish yet.”
4. Inspect the hosted preview or use `dev`. Publish only when requested. Sharing a Page does not grant source access.

## Diagnostics and language

`pubvero doctor --server https://your-instance.example/mcp` checks public discovery, not login or query permissions. `check` is heuristic, not a security audit.

Use `--locale en|pt_BR`; otherwise locale follows `LC_ALL`, `LC_MESSAGES`, then `LANG`, with English for unsupported values. Authored content is not translated. `--json` keeps stdout machine-readable; authorization instructions remain on stderr. Exit 0 means success, 1 means a finding or failure.

## Verify

```sh
npm run verify
npx playwright install chromium
npm run test:e2e
npm audit
npm pack --dry-run
```

Tests cover subprocesses, package installation, official-SDK OAuth/PKCE against controlled responses, loopback security, versioned writes and Chromium preview in both languages. Backend permissions have a separate integration suite. CI covers Linux/macOS/Windows on Node 24/26 plus Chromium. Tests do not claim a real user's staging consent or live customer-source execution was completed.

MIT licensed. See [SECURITY.md](SECURITY.md).
