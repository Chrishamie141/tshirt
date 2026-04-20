# t-shirt (Next.js + SQLite + Drizzle)

Full-stack e-commerce web app for a t-shirt/clothing brand with:

- Next.js (App Router), React, TypeScript, Tailwind CSS
- SQLite + Drizzle ORM
- Zustand cart state
- Stripe checkout integration
- Admin authentication + inventory management
- OpenAI-powered customer support chatbot

## Features

- Homepage with hero, featured products, category highlights, newsletter, chatbot launcher
- Shop/category pages with filters (size, price, stock)
- Product detail pages
- Cart with quantity updates/removal + Stripe checkout redirect
- Order confirmation page
- Admin login + dashboard for product CRUD and inventory updates
- AI chatbot API that can reference product catalog data
- Seed script for categories, products, and default admin user

## Tech choices

- **No Prisma** (uses Drizzle + direct SQL table bootstrap)
- TypeScript everywhere (`src` + seed script)
- Environment-variable based secrets

## Setup

1. Install deps:

   ```bash
   npm install
   ```

2. Copy env file:

   ```bash
   cp .env.example .env
   ```

3. Seed database:

   ```bash
   npm run db:seed
   ```

4. Run dev server:

   ```bash
   npm run dev
   ```

Open http://localhost:3000.

## Default admin credentials

- Email: `admin@tshirt.com`
- Password: `admin1234`

> Change these immediately in production.

## Important environment variables

- `DATABASE_URL` (SQLite path, default `file:./tshirt.db`)
- `JWT_SECRET` for admin session token signing
- `STRIPE_SECRET_KEY` for checkout session creation
- `OPENAI_API_KEY` for chatbot responses
- `NEXT_PUBLIC_APP_URL` for Stripe redirect URLs

## Production notes

- Add Stripe webhooks for robust order status reconciliation.
- Move images to a CDN/storage bucket.
- Add rate limiting on chatbot and auth endpoints.
- Add CSRF protection and full audit logs for admin actions.
