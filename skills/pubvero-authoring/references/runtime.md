# Pubvero Page runtime contract

## Hosted runtime

The platform injects this asynchronous API into the sandboxed Page iframe:

```javascript
const viewer = await page.viewer();
const result = await page.query('campaign-metrics', { days: 30 });
```

`page.viewer()` returns only the authorized viewer context:

```json
{
  "id": "42",
  "name": "Ada",
  "locale": "en",
  "teams": [{ "id": "7", "name": "Marketing" }]
}
```

For a PostgreSQL binding, `page.query()` returns:

```json
{
  "columns": ["campaign", "spend"],
  "rows": [{ "campaign": "Spring", "spend": 125.5 }],
  "truncated": false
}
```

Rows are encoded as JSON by the database: numeric columns arrive as JSON
numbers, integers beyond 64 bits and timestamps arrive as strings.

For an HTTP GET binding, `page.query()` returns `{ status, content_type, body }`.
The body is a string, not a pre-parsed object:

```javascript
const response = await page.query('service-metrics', { days: 30 });
if (response.status < 200 || response.status >= 300) {
  throw new Error('The data service returned an unsuccessful response.');
}
const metrics = JSON.parse(response.body);
```

Use JSON parsing only when the approved operation returns JSON. Render data as
text rather than trusted HTML and localize any user-facing error for the Page.

The iframe Content Security Policy disables direct network access. All data access is relayed by the trusted parent, and the backend rechecks Page access, the binding author's grants, and the viewer's Connection grants on every query. No browser credential can bypass that boundary.

## Connected preview

The hosted draft preview can read real data under the current author and viewer
permissions. Use the preview URL returned by the MCP. The planned local CLI
will relay authorized bindings through Pubvero; it is not yet available.
Do not replace connected results with fixtures when authorization or a query fails.

## Local fixture workflow

Save the generated Page as `page.html`. Before its application script, add an explicit fixture-only implementation:

```html
<script>
  window.page = Object.freeze({
    async viewer() {
      return {
        id: 'local-viewer',
        name: 'Local Preview',
        locale: 'en',
        teams: [{ id: 'marketing', name: 'Marketing' }],
      };
    },
    async query(name, parameters = {}) {
      if (name !== 'campaign-metrics') {
        throw new Error(`Missing local fixture for binding: ${name}`);
      }

      if (!Number.isInteger(parameters.days)) {
        throw new Error('The days fixture parameter must be an integer.');
      }

      return {
        columns: ['campaign', 'spend'],
        rows: [{ campaign: 'Fixture campaign', spend: 125.5 }],
        truncated: false,
      };
    },
  });
</script>
```

Serve the directory with any local static HTTP server and open `page.html`. Keep the fixture visibly local and synthetic. Never copy production credentials, SQL access, customer exports, or real sensitive rows into the preview file.

Remove the fixture implementation before sending HTML to `create-page` or `update-page`; the hosted runtime supplies `window.page` automatically.
