This worker is the entrypoint for deploying the Angular static assets along with server-side API endpoints.

Key notes:
- The ASSETS binding must be set in wrangler.toml as:
  [assets]
  directory = "frontend/dist/frontend/browser"
  binding = "ASSETS"

- The worker routes /api/chat POST to the inline handler which can read GEMINI_API_KEY and OPENAI_API_KEY via environment variables provided by Cloudflare.

- Make sure to set your secrets via `npx wrangler secret put GEMINI_API_KEY` and `npx wrangler secret put OPENAI_API_KEY` or via the Cloudflare dashboard.
