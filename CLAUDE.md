# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Resume YouTube is a Next.js 15 dashboard application that allows users to monitor YouTube channels and receive AI-generated summaries via WhatsApp. The app integrates with Supabase for authentication and data storage, Stripe for payments, and uses the YouTube Data API for channel validation.

## Development Commands

- **Start development server**: `npm run dev` (uses Turbopack for faster builds)
- **Build for production**: `npm run build`
- **Start production server**: `npm start`
- **Lint code**: `npm run lint`

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15 with App Router architecture
- **Language**: TypeScript with strict mode
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Authentication**: Supabase Auth with SMS/OTP
- **Payments**: Stripe for subscription management
- **UI**: Tailwind CSS v4 + Shadcn/ui components
- **API Integration**: YouTube Data API v3

### Key Features
1. **Authentication**: SMS-based login via Supabase Auth
2. **Channel Management**: Add/remove YouTube channels (limit: 3 per user)
3. **Summaries**: View AI-generated video summaries with filtering
4. **Billing**: Stripe integration for R$ 39,90/month subscriptions
5. **Dashboard**: Statistics and overview of user activity

## Database Schema (Supabase)

Key tables in the database:
- `users`: User profiles with subscription status
- `youtube_channels`: Monitored YouTube channels
- `processed_videos`: AI-generated video summaries
- `subscriptions`: Stripe subscription data
- `conversation_logs`: WhatsApp bot interaction logs

Important functions:
- `get_user_status(phone)`: Get complete user info
- `can_add_channel(user_id)`: Check if user can add channels
- `get_channels_to_check(limit)`: Get channels for monitoring

## Key Directories

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Protected dashboard pages
│   └── api/               # API routes (Stripe, YouTube)
├── components/            # React components
│   ├── dashboard/         # Dashboard layout components
│   ├── channels/          # Channel management
│   ├── summaries/         # Summary display
│   ├── billing/           # Stripe billing
│   └── ui/                # Shadcn/ui components
└── lib/                   # Utilities and configurations
    ├── supabase/          # Supabase client/server
    ├── stripe.ts          # Stripe utilities
    ├── youtube.ts         # YouTube API helpers
    └── types.ts           # TypeScript definitions
```

## Environment Variables Required

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://elvascbrrxmptiooybxw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_... # Monthly subscription price

# YouTube API
YOUTUBE_API_KEY=AIza...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Important Implementation Notes

### Authentication Flow
- Uses Supabase Auth with SMS/OTP for Brazilian phone numbers
- Middleware protects dashboard routes (`middleware.ts`)
- User profiles are automatically created in `users` table

### Subscription Management
- R$ 39,90/month recurring subscription via Stripe
- Webhook handles subscription status updates
- Users limited to 3 channels and 30 summaries/month

### YouTube Integration
- Validates YouTube channel URLs and extracts channel info
- Supports different URL formats (@username, /c/channel, /channel/id)
- Uses YouTube Data API v3 for channel verification

### UI Components
- Shadcn/ui components with Tailwind CSS styling
- Responsive design with mobile-first approach
- Dark mode support via CSS variables
- Toast notifications using Sonner

### Security
- Row Level Security (RLS) enabled on all Supabase tables
- Server-side validation for all user actions
- Stripe webhook signature verification
- Protected API routes with user authentication

## Development Workflow

1. **Authentication**: Start with `/auth/login` or `/auth/register`
2. **Dashboard**: Main dashboard at `/dashboard` shows overview
3. **Channels**: Manage channels at `/dashboard/channels`
4. **Summaries**: View summaries at `/dashboard/summaries`
5. **Billing**: Subscription management at `/dashboard/billing`
6. **Settings**: User preferences at `/dashboard/settings`

## Integration with WhatsApp Bot

- The dashboard is read-only for WhatsApp integration
- Bot reads from `processed_videos` table to send summaries
- Bot updates `sent_to_user` field when summaries are delivered
- All user communication happens via WhatsApp, not the dashboard

## Common Development Tasks

- **Add new UI components**: Use `npx shadcn@latest add [component]`
- **Database changes**: Update types in `src/lib/database.types.ts`
- **New API routes**: Follow patterns in `src/app/api/`
- **Styling**: Use Tailwind classes with Shadcn/ui components