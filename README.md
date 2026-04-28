# t-shirt (Next.js + PostgreSQL + Drizzle)

Full-stack e-commerce web app for a t-shirt/clothing brand with:

- Next.js (App Router), React, TypeScript, Tailwind CSS
- PostgreSQL + Drizzle ORM
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

## Setup

1. Install deps:

   ```bash
   npm install
   ```

2. Copy env file:

   ```bash
   cp .env.example .env
   ```

3. Set `DATABASE_URL` to your PostgreSQL connection string.

4. Bootstrap schema (Drizzle push):

   ```bash
   npm run db:push
   ```

5. Seed data:

   ```bash
   npm run db:seed
   ```

6. Run dev server:

   ```bash
   npm run dev
   ```

Open http://localhost:3000.

## Default admin credentials

- Email: `admin@tshirt.com`
- Password: `admin1234`

> Change these immediately in production.

## Required environment variables

- `DATABASE_URL` (PostgreSQL URL)
- `JWT_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `STRIPE_SECRET_KEY`

## Render deployment

### Render PostgreSQL

1. Create a PostgreSQL database service in Render.
2. Copy its **Internal Database URL** and use it as `DATABASE_URL` for your web service.

### Render Web Service

- Build command: `npm install && npm run build`
- Start command: `npm run start`

Set all required environment variables in the web service.

On first deploy, run:

```bash
npm run db:push
npm run db:seed
```

`db:seed` is idempotent and safe to rerun.
