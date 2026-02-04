This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Supabase (real data)

The app can use **Supabase** for real data. When `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set, all portfolio data (funds, companies, signals, alerts, tasks, etc.) is loaded from Supabase. When they are not set, the app uses mock data from `lib/mock-data.ts`.

1. **Create a Supabase project** at [supabase.com](https://supabase.com) and get your API keys (Settings → API Keys).

2. **Run the schema**  
   In the Supabase SQL Editor, run the migration:
   - `supabase/migrations/20250129000000_initial_schema.sql`

3. **Optional: seed demo data**  
   Run `supabase/seed.sql` in the SQL Editor to load the same demo data as the mock (Mantis, Thrive, USV with sample companies and alerts).

4. **Configure env**  
   In `.env.local`, add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...  # or legacy anon key
   SUPABASE_SERVICE_ROLE_KEY=sb_secret_...  # or legacy service_role key
   ```
   
   **New API keys (recommended):** Use keys from the "Publishable and secret API keys" tab:
   - `sb_publishable_...` (replaces anon key)
   - `sb_secret_...` (replaces service_role key)
   
   **Legacy keys (still supported):** Use keys from the "Legacy anon, service_role API keys" tab:
   - JWT-based anon key
   - JWT-based service_role key

5. Restart the dev server. The app will read and write from your Supabase project.

6. **Run the tracked URLs migration**  
   In the Supabase SQL Editor, run:
   - `supabase/migrations/20250130000000_add_tracked_urls.sql`

## Signal Collection (Automated Monitoring)

The app can automatically discover and monitor company URLs to detect changes and generate signals.

**How it works:**

1. **Run signal collection** — On any company page, click "Run signal collection"
2. **AI discovery** — The system uses AI to find careers, blog, and LinkedIn URLs from the company website
3. **URL monitoring** — Discovered URLs are saved and checked for changes (using content hashing)
4. **Change detection** — When a URL changes, AI summarizes what changed and creates a signal
5. **News search** — Dynamically searches for recent news articles about the company
6. **Live updates** — Watch the process in real-time with a streaming modal showing progress

**Requirements:**
- `OPENAI_API_KEY` in `.env.local` (for AI discovery and summarization)
- `SUPABASE_SERVICE_ROLE_KEY` (for writing signals and tracked URLs)

**Tracked URLs:**
- **Static URLs** (saved): Careers page, blog, LinkedIn company page — these are discovered once and monitored
- **Dynamic sources** (searched): News articles — searched on-demand, not stored as URLs

**Caching:**
- Results are cached for 24 hours to avoid excessive API calls
- Use `?force=true` or click "Run signal collection" again to force a refresh

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Alpha Setup for Mantis Ventures

For alpha release to Mantis Ventures contacts:

1. **Deploy to Vercel** — Connect repo, add env vars (see Phase 1 of [docs/ALPHA_INVITE.md](docs/ALPHA_INVITE.md)).
2. **Supabase** — Run all migrations, insert Mantis fund, seed Mantis companies.
3. **FUND_CREDENTIALS** — Add `[{"fundId":"mantis-ventures","username":"mantisventures","password":"YOUR_PASSWORD"}]` to Vercel env.
4. **Invite doc** — Share [docs/ALPHA_INVITE.md](docs/ALPHA_INVITE.md) with contacts (include password securely).

See [docs/ALPHA_INVITE.md](docs/ALPHA_INVITE.md) for the full alpha invite and demo script.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
