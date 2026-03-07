# Ameenly

Share duas and make duas for others. Ramadan is the month of dua — the fasting person's dua isn't rejected. When you make dua for someone else, the angels say "Ameen and for you as well."

## Features

- **Public wall** — Submit duas anonymously or with a name. Browse and say Ameen on others' duas. No account needed.
- **Private groups** — Create groups, share invite links, and share duas only with members.
- **Group admin** — Delete posts and manage members.

## Tech Stack

- Next.js 16 (App Router)
- React 19
- Convex (database + real-time)
- Clerk (auth for groups)
- Tailwind CSS v4

## Getting Started

### 1. Install dependencies

```bash
bun install
```

### 2. Set up Convex

```bash
bunx convex dev
```

Follow the prompts to create or link a Convex project. This generates `convex/_generated/` and populates `.env.local` with `NEXT_PUBLIC_CONVEX_URL` and `CONVEX_DEPLOYMENT`.

### 3. Set up Clerk

1. Create an app at [clerk.com](https://clerk.com)
2. Add your Clerk keys to `.env.local`:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
3. In the Convex dashboard, set `CLERK_JWT_ISSUER_DOMAIN` (your Clerk Frontend API URL)
4. In the Clerk dashboard, add a webhook pointing to `https://your-domain.com/api/webhooks/clerk` with `user.created` and `user.updated` events. Set `CLERK_WEBHOOK_SECRET` in `.env.local` and in the Convex dashboard.

### 4. Environment variables

Copy `.env.example` to `.env.local` and fill in:

- `NEXT_PUBLIC_CONVEX_URL` — from Convex
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — from Clerk
- `CLERK_SECRET_KEY` — from Clerk
- `CLERK_WEBHOOK_SECRET` — from Clerk webhook
- `CLERK_JWT_ISSUER_DOMAIN` — from Clerk (e.g. `https://xxx.clerk.accounts.dev`)

### 5. Run the app

```bash
bun run dev
```

## Project Structure

```
├── convex/           # Convex backend
│   ├── schema.ts     # Database schema
│   ├── duas.ts       # Public wall functions
│   ├── groups.ts     # Group CRUD
│   ├── groupDuas.ts  # Group dua functions
│   └── users.ts      # User sync (webhook)
├── src/
│   ├── app/
│   │   ├── page.tsx           # Public wall
│   │   ├── groups/            # Group pages
│   │   ├── join/[code]/       # Join via invite link
│   │   └── api/webhooks/      # Clerk webhook
│   └── components/
│       ├── DuaCard.tsx
│       ├── DuaWall.tsx
│       ├── SubmitDuaForm.tsx
│       └── ...
└── docs/
    └── PRD.md        # Product requirements
```

## License

MIT
