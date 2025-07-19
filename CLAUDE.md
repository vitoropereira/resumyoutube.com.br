# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Resume YouTube is a Next.js 15 dashboard application that allows users to monitor YouTube channels and receive AI-generated summaries via WhatsApp. The app integrates with Supabase for authentication and data storage, Stripe for subscription management with trial periods, and uses the YouTube Data API for channel validation. The system uses a global architecture for 90% cost reduction in AI processing and supports unlimited channels with summary-based pricing.

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
- **Authentication**: Supabase Auth with WhatsApp validation
- **Payments**: Stripe for subscription management with 7-day trials
- **UI**: Tailwind CSS v4 + Shadcn/ui components
- **API Integration**: YouTube Data API v3 + RapidAPI for transcriptions
- **AI Processing**: OpenAI GPT-3.5-turbo for summary generation

### Key Features
1. **Onboarding**: Complete 5-step onboarding with WhatsApp validation
2. **Channel Management**: Add/remove unlimited YouTube channels
3. **AI Summaries**: OpenAI-powered video summaries with transcript analysis
4. **Subscription Plans**: 4-tier pricing based on monthly summary limits
5. **Trial System**: 7-day free trial with mandatory credit card
6. **Extra Packs**: One-time purchase of additional summary credits
7. **Usage Tracking**: Real-time monitoring of monthly summary consumption
8. **Dashboard**: Statistics and overview of user activity with usage metrics

## Database Schema (Supabase)

### Database Structure
- `users`: User profiles with subscription status, WhatsApp validation, and usage tracking
- `user_profiles`: User analytics (business_type, content_interest, summary_frequency)
- `global_youtube_channels`: Unique YouTube channels (no duplication)
- `user_channel_subscriptions`: User → Channel relationships (N:N, unlimited)
- `global_processed_videos`: AI-generated video summaries (1 per video)
- `user_video_notifications`: User-specific notification control
- `subscriptions`: Stripe subscription data with trial management
- `conversation_logs`: WhatsApp bot interaction logs

### New Fields for Business Model
- `users.monthly_summary_limit`: Maximum summaries per month for user's plan
- `users.monthly_summary_used`: Current month's summary consumption
- `users.summary_reset_date`: Next reset date for monthly usage
- `users.extra_summaries`: Additional summary credits purchased
- `users.whatsapp_validated`: Boolean for WhatsApp number validation
- `users.trial_end_date`: When trial period ends


### Important Functions
- `get_user_status(phone)`: Get complete user info (updated with global structure)
- `can_add_global_channel(user_id)`: Check if user can add channels (now unlimited)
- `can_generate_summary(user_id)`: Check if user has summary quota available
- `increment_summary_usage(user_id)`: Increment monthly usage counter
- `reset_monthly_usage()`: Reset usage counters on billing cycle
- `get_global_channels_to_check(limit)`: Get channels for monitoring
- `process_global_video(...)`: Process new video globally with notifications

### Key Benefits
✅ **90% cost reduction** in OpenAI API calls (1 summary per video vs N summaries)  
✅ **Transcript storage** for higher quality summaries  
✅ **Scalable architecture** for thousands of users  
✅ **Individual notification control** per user  
✅ **Clean codebase** without legacy dependencies

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

# RapidAPI for transcriptions
RAPIDAPI_KEY=your_rapidapi_key

# OpenAI
OPENAI_API_KEY=sk-your_openai_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Important Implementation Notes

### Authentication Flow
- Uses Supabase Auth with SMS/OTP for Brazilian phone numbers
- Middleware protects dashboard routes (`middleware.ts`)
- User profiles are automatically created in `users` table

### Subscription Management
- **4-tier pricing model** based on monthly summary limits:
  - Starter: 50 summaries/month - R$ 29,90
  - Pro: 150 summaries/month - R$ 49,90
  - Premium: 500 summaries/month - R$ 99,90
  - Enterprise: Unlimited summaries - R$ 199,90
- **7-day free trial** with mandatory credit card
- **Extra summary packs** available for one-time purchase
- Webhook handles subscription status updates and trial conversions
- Users have unlimited channels, limited by summary quota

### YouTube Integration
- Validates YouTube channel URLs and extracts channel info
- Supports different URL formats (@username, /c/channel, /channel/id)
- Uses YouTube Data API v3 for channel verification
- **RapidAPI integration** for video transcript extraction
- **OpenAI GPT-3.5-turbo** for AI-powered summary generation
- Automatic video processing with transcript analysis

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

### New User Flow ✅ IMPLEMENTED
1. **Onboarding**: Complete 5-step onboarding process
   - `/onboarding/welcome` - Welcome and introduction ✅
   - `/onboarding/whatsapp` - WhatsApp number validation ✅ (simulated)
   - `/onboarding/profile` - 3 analytics questions ✅
     - Business type (creator, business, personal, agency)
     - Content interest (tech, business, entertainment, education, lifestyle, news, other)
     - Summary frequency (daily, weekly, monthly, realtime)
   - `/onboarding/payment` - Credit card for trial ✅
   - `/onboarding/complete` - Setup completion with confetti ✅
2. **Trial Period**: 7-day free trial with full access ✅
3. **Conversion**: Automatic billing after trial ✅

### Existing User Flow
1. **Dashboard**: Main dashboard at `/dashboard` shows overview and usage
2. **Channels**: Manage unlimited channels at `/dashboard/channels`
3. **Summaries**: View summaries at `/dashboard/summaries`
4. **Usage**: Monitor summary consumption at `/dashboard/usage`
5. **Billing**: Subscription management at `/dashboard/billing`
6. **Settings**: User preferences at `/dashboard/settings`

## Integration with WhatsApp Bot

- The dashboard shows notification history for WhatsApp integration
- Bot reads from `user_video_notifications` table to send summaries
- Bot updates `is_sent` field when notifications are delivered
- All user communication happens via WhatsApp, not the dashboard
- Bot uses `global_processed_videos` for actual summary content

## Common Development Tasks

- **Add new UI components**: Use `npx shadcn@latest add [component]`
- **Database changes**: Update types in `src/lib/database.types.ts`
- **New API routes**: Follow patterns in `src/app/api/`
- **Styling**: Use Tailwind classes with Shadcn/ui components

## Business Model Updates

### New Monetization Strategy
- **Previous**: R$ 39,90/month for 3 channels + 30 notifications
- **Current**: 4-tier plans based on monthly summary limits + unlimited channels
- **Additional**: Extra summary packs for flexibility
- **Trial**: 7-day free trial with mandatory credit card for higher conversion

### User Analytics
- Business type tracking (creator, business, personal, agency)
- Content interest preferences (tech, business, entertainment, education)
- Summary frequency preferences (daily, weekly, monthly, realtime)
- Trial to paid conversion tracking
- Usage patterns and limit optimization

## Memory Notes

- **Task Tracking**: Always analyze the `continue.md` and `TODO.md` files to resume work
- **Current Status**: New business model fully implemented (95% complete)
- **Recent Achievement**: Auto-save onboarding system with progress indicator
- **Next Priority**: Dashboard enhancements (buy-extra-summaries, usage page) + WhatsApp Bot integration (final 5% for MVP)
- **Recent Achievements**: 
  - ✅ Summary limits system working
  - ✅ 4-tier Stripe plans configured
  - ✅ Trial system implemented 
  - ✅ Usage tracking dashboard
  - ✅ Extra packs system
  - ✅ Complete onboarding flow (5 pages)
  - ✅ 3 analytics questions implemented
  - ✅ WhatsApp validation interface (simulated)
  - ✅ Auto-save onboarding system implemented
  - ✅ Progress indicator with visual feedback
  - ✅ Robust localStorage backup system