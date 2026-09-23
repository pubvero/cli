# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

People using agents to create and securely share reports, dashboards and HTML Pages, across engineering and other disciplines.

## Product Purpose

The CLI supports local authoring alongside Pubvero's hosted MCP server. A connected preview executes approved bindings through the server with the user's authorization; source credentials never enter the Page.

## Operating Context

Authors edit HTML locally, inspect it in a browser, upload a draft and explicitly publish an immutable version from the terminal. The user confirmed a full-window preview with a compact connection/version bar and a reload button. Publication controls stay out of the preview.

## Capabilities and Constraints

Node.js 24 or newer. Brazilian Portuguese and English. Preview data must be authorized real data, never a synthetic fallback. Tokens remain in the CLI process, not in browser storage or project files. MCP clients do not require the CLI.

## Brand Commitments

Preserve Pubvero's established green and neutral identity and approved Edition mark. The Page, not platform chrome, is the primary object.

## Product Principles

- Keep Page access and source access distinct.
- Recheck permissions at the server for each data request.
- Separate local preview, draft upload and publication.
- Make failures explicit; never replace unavailable data with invented results.
