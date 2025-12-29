# Instagram DM Automation Workspace

A Next.js-powered console for orchestrating personalised Instagram direct-message campaigns. Import recipients, craft dynamic templates with merge variables, schedule or dispatch messages instantly, and monitor delivery activity — all deployable on Vercel.

## Features

- **Recipient management** with tagging, live preview, and local persistence.
- **Template composer** supporting merge variables such as `{{first_name}}` and campaign-specific tokens.
- **Scheduling controls** for ad-hoc or queued sends (runs while the tab is open).
- **Timeline analytics** showing queued, sending, sent, and failed events.
- **Graph API integration** via serverless route that posts to the Instagram Messaging endpoint.

## Getting Started

### Prerequisites

- Node.js 18.18+ (matches Vercel/Next.js 14 requirements)
- npm 9+ (bundled with recent Node releases)

### Installation

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to access the dashboard.

### Production Build

```bash
npm run build
npm start
```

## Environment Configuration

Create a `.env.local` file with your Meta credentials:

```bash
INSTAGRAM_ACCESS_TOKEN=EAAG...
INSTAGRAM_SENDER_ID=1784...
# Optional: defaults to v19.0
META_GRAPH_VERSION=v19.0
```

- `INSTAGRAM_ACCESS_TOKEN` — Long-lived user token with the `instagram_manage_messages` permission.
- `INSTAGRAM_SENDER_ID` — Instagram Business Account ID that will send the message.
- `META_GRAPH_VERSION` — Graph API version (defaults to `v19.0`).

Restart the dev server after updating environment variables.

## Key Scripts

- `npm run dev` — Start the local development server.
- `npm run build` — Create a production build (runs TypeScript and Next.js compilation).
- `npm run start` — Serve the production build locally.
- `npm run lint` — Check code quality with Next.js ESLint rules.

## Deployment

The project is optimised for Vercel:

1. Set the environment variables in your Vercel project dashboard.
2. Run `npm run build` locally to ensure the app compiles.
3. Deploy with the provided CLI command (requires `VERCEL_TOKEN`):

   ```bash
   vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-a1cce0aa
   ```

4. Verify once DNS propagates:

   ```bash
   curl https://agentic-a1cce0aa.vercel.app
   ```

## Notes & Limitations

- Scheduling leverages in-browser timers; for guaranteed delivery while offline, integrate with a persistent job queue (e.g., Vercel Cron + external store).
- Meta rate limits and permission scopes apply. Handle errors in the activity timeline and retry manually if needed.
- Recipient data and activity logs persist in `localStorage` only; connect an external database for multi-user access.

## License

Released under the MIT License.
