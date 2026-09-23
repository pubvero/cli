# Pubvero Agent Kit

Create dashboards, reports and HTML Pages with an agent, then share them through Pubvero with controlled access to content and data.

[Português brasileiro](README.pt-BR.md) · [Commands](docs/commands.md) · [Security](SECURITY.md) · [Contributing](CONTRIBUTING.md)

## What works today

- **Agent skill:** author Pages through your existing Pubvero MCP connection, use authorized PostgreSQL or HTTP GET bindings, and publish when requested.
- **Local CLI:** create a self-contained HTML starter, run basic authoring diagnostics, locate the skill and check public OAuth discovery.
- **Real data:** use the hosted draft preview returned by MCP. Pubvero checks Page and source permissions on the backend.

This is an early authoring toolkit, **not a connected local preview or a standalone MCP client**. CLI OAuth login, `dev`, binding execution and CLI publication are not implemented. The MCP connection does not require this CLI. See the [roadmap](docs/roadmap.md).

## Start from source

Requires Node.js 24 or newer. No runtime dependencies, install hooks, telemetry, stored tokens or global configuration changes.

```sh
git clone https://github.com/pubvero/cli.git
cd cli
npm ci --ignore-scripts
node bin/pubvero.js --help
node bin/pubvero.js init page.html
node bin/pubvero.js check page.html
```

Optional: `npm link` makes `pubvero` available in your current Node installation. Undo with `npm unlink --global @pubvero/cli`.

`@pubvero/cli` is the intended package name, **not a published npm installation instruction**. The package is marked private to prevent accidental publication until registry ownership and the release process are confirmed.

## Use with your agent

1. Add your trusted instance's `/mcp` HTTPS URL to a client supporting remote MCP and OAuth. Complete that client's authorization flow. Do not paste source credentials into the agent.
2. Add the complete [`skills/pubvero-authoring`](skills/pubvero-authoring) directory to your client's supported skill location. Preserve `references/`. Skill installation locations vary by client; this CLI does not rewrite client settings.
3. Ask the agent to use `pubvero-authoring`, discover accessible workspaces and sources, and build your Page. For example:

   > Create a support report in my workspace using the approved support-metrics operation. Keep it as a draft, show loading and error states, and give me the preview URL. Do not publish it yet.

4. Review the hosted draft with real data. Request publication when ready. Sharing a Page does not grant source access.

Use `node bin/pubvero.js skill` to locate the bundled entrypoint. This command prints a path; it does not install anything. If your agent cannot access that path, copy the entire skill directory using its supported mechanism.

## Diagnose your instance

Replace the example host with your actual trusted staging or production hostname:

```sh
node bin/pubvero.js doctor --server https://your-instance.example/mcp
```

The command performs one unauthenticated GET to the public protected-resource metadata endpoint. It checks the resource URL and HTTPS authorization-server metadata. It does **not** verify login, tool compatibility, tenant access, query execution or ownership of the server. Redirects are rejected; use the final canonical URL. No data is sent to another service.

`pubvero.io` is the registered product domain; registration alone does not mean the application is deployed there. Use the operational URL supplied by your workspace administrator.

## Language and automation

Use `--locale en` or `--locale pt_BR`. Without an explicit option, the CLI uses `LC_ALL`, `LC_MESSAGES`, then `LANG`; unsupported environment languages use English. The generated Page uses the chosen language. User-created content is never translated automatically.

`--json` produces machine-readable output. Diagnostic codes are stable across languages. Exit status `0` means the requested diagnostic succeeded; `1` means a finding or failure. Neither implies a security certification.

## Verify and contribute

```sh
npm run verify
npm audit
npm pack --dry-run
```

Tests exercise real CLI subprocesses, temporary files, simulated discovery responses and installation of the package tarball. CI runs on Linux, macOS and Windows, with Node 24 and 26. This matrix is configured, not a claim that every remote run has already passed.

MIT licensed. Security limitations and responsible reporting are in [SECURITY.md](SECURITY.md).
