@AGENTS.md

# Time Tracking App

个人专注时间追踪网站，记录各领域累计时间并展示向 3000h/7000h 里程碑的进度。

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Auth | Auth.js v5 (`next-auth@beta`) — Google OAuth + Resend magic link |
| Database | PostgreSQL via Prisma ORM |
| UI | Tailwind CSS + shadcn/ui components |
| Charts | Recharts (RadialBarChart for weekly goal) |
| Deployment | Vercel + Neon (serverless Postgres) |

**Node version:** 20 (see `.nvmrc`). Run `nvm use` before any npm commands.

## Project Structure

```
app/
  (auth)/login        # login page — Google + email magic link
  (auth)/verify       # post-email-send page
  (app)/dashboard     # progress cards + weekly goal ring
  (app)/timer         # start/stop timer (client component with interval)
  (app)/domains       # create/manage domains
  (app)/domains/[id]  # domain detail + session history
  (app)/settings      # weekly goal hours, account info
  api/auth/[...nextauth]  # Auth.js handler
  api/domains         # GET list / POST create
  api/domains/[id]    # PATCH / DELETE
  api/timer/start     # POST — creates TimeSession (endTime: null)
  api/timer/stop      # POST — sets endTime + durationMinutes
  api/sessions        # GET — paginated history
  api/stats           # GET — aggregated dashboard data
  api/user            # PATCH — weeklyGoalHours

components/
  layout/Sidebar      # nav + sign out
  dashboard/ProgressCard      # per-domain 3000h/7000h bars
  dashboard/WeeklyGoalCard    # radial progress ring
  dashboard/DomainProgressBar # reusable progress bar
  timer/TimerClient   # client component: interval, start/stop, sendBeacon
  domains/DomainsClient       # create form + domain list
  settings/SettingsClient     # weekly goal editor

lib/
  auth.ts   # Auth.js config (providers, callbacks, session.user.id)
  db.ts     # Prisma client singleton
  utils.ts  # cn(), formatDuration(), formatTimer(), getStartOfWeek()

prisma/
  schema.prisma  # User, Account, Session, VerificationToken, Domain, TimeSession
```

## Key Data Model

- `Domain` — belongs to User; has name, color, icon
- `TimeSession` — `endTime: null` means timer is running; `durationMinutes` written on stop
- `User.weeklyGoalHours` — default 10; used for weekly progress %
- Progress to 3000h/7000h = `SUM(durationMinutes) / (Nh * 60) * 100`

## Common Commands

```bash
nvm use                              # switch to Node 20
npm run dev                          # start dev server
npx prisma migrate dev --name <name> # create migration
npx prisma studio                    # browse DB
npx prisma generate                  # regenerate client after schema change
```

## Environment Variables

Copy `.env.local.example` → `.env.local` and fill in:

```
DATABASE_URL        # Neon PostgreSQL connection string
AUTH_SECRET         # openssl rand -base64 32
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
AUTH_RESEND_KEY     # from resend.com
```

## Timer Logic

- **Start**: checks for existing `endTime: null` session (409 if found)
- **Stop**: computes `durationMinutes = (now - startTime) / 60000`, writes to DB
- **Recovery**: page load fetches active session from DB; JS interval resumes from `Date.now() - startTime`
- **Tab close**: `navigator.sendBeacon('/api/timer/stop')` fires on `beforeunload`

## Deployment (Vercel + Neon)

1. Push to GitHub → Import in Vercel
2. Set all env vars in Vercel Dashboard → Settings → Environment Variables
3. Add `https://your-app.vercel.app/api/auth/callback/google` to Google OAuth
4. Run migration against prod DB: `DATABASE_URL=<prod> npx prisma migrate deploy`
