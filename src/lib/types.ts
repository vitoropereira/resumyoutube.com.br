import { Database } from './database.types'

// ===================================
// GLOBAL DATABASE TYPE HELPERS
// ===================================

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
export type Functions<T extends keyof Database['public']['Functions']> = Database['public']['Functions'][T]
export type Views<T extends keyof Database['public']['Views']> = Database['public']['Views'][T]['Row']

// ===================================
// BASIC TABLE TYPES
// ===================================

export type User = Tables<'users'>
export type GlobalYouTubeChannel = Tables<'global_youtube_channels'>
export type UserChannelSubscription = Tables<'user_channel_subscriptions'>
export type GlobalProcessedVideo = Tables<'global_processed_videos'>
export type UserVideoNotification = Tables<'user_video_notifications'>
export type Subscription = Tables<'subscriptions'>
export type ConversationLog = Tables<'conversation_logs'>

// Legacy types (for compatibility)
export type YoutubeChannel = Tables<'youtube_channels'>
export type ProcessedVideo = Tables<'processed_videos'>

// Views
export type ActiveUser = Views<'active_users'>
export type SystemStats = Views<'system_stats'>

// ===================================
// BUSINESS MODEL ENUMS
// ===================================

export type BusinessType = 'creator' | 'business' | 'personal' | 'agency'
export type ContentInterest = 'tech' | 'business' | 'entertainment' | 'education' | 'lifestyle' | 'news' | 'other'
export type SummaryFrequency = 'daily' | 'weekly' | 'monthly' | 'realtime'
export type SubscriptionStatus = 'incomplete' | 'incomplete_expired' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid'

// ===================================
// FUNCTION RETURN TYPES
// ===================================

// get_user_status function return type
export interface UserStatus {
  exists: boolean
  user_id?: string
  name?: string
  phone_number?: string
  subscription_status?: SubscriptionStatus
  subscription_end?: string
  max_channels?: number
  legacy_channels?: number
  global_channels?: number
  total_channels?: number
  can_add_channel?: boolean
  can_generate_summary?: boolean
  monthly_summary_limit?: number
  monthly_summary_used?: number
  extra_summaries?: number
  whatsapp_validated?: boolean
  stripe_customer_id?: string
}

// get_user_global_channels function return type
export interface UserGlobalChannel {
  subscription_id: string
  global_channel_id: string
  youtube_channel_id: string
  channel_name: string
  channel_url: string
  subscriber_count: number
  is_active: boolean
  subscribed_at: string
}

// get_global_channels_to_check function return type
export interface GlobalChannelToCheck {
  channel_id: string
  youtube_channel_id: string
  channel_name: string
  channel_url: string
  last_video_id: string
  last_check_at: string
  subscriber_count: number
}

// ===================================
// SUBSCRIPTION PLAN TYPES
// ===================================

export interface SubscriptionPlan {
  name: string
  price_cents: number
  price_display: string
  monthly_summary_limit: number
  features: string[]
  popular?: boolean
}

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  starter: {
    name: 'Starter',
    price_cents: 2990,
    price_display: 'R$ 29,90',
    monthly_summary_limit: 50,
    features: ['50 resumos/mês', 'Canais ilimitados', 'WhatsApp integrado', 'Suporte básico'],
  },
  pro: {
    name: 'Pro',
    price_cents: 4990,
    price_display: 'R$ 49,90',
    monthly_summary_limit: 150,
    features: ['150 resumos/mês', 'Canais ilimitados', 'WhatsApp integrado', 'Suporte prioritário', 'Analytics avançado'],
    popular: true,
  },
  premium: {
    name: 'Premium',
    price_cents: 9990,
    price_display: 'R$ 99,90',
    monthly_summary_limit: 500,
    features: ['500 resumos/mês', 'Canais ilimitados', 'WhatsApp integrado', 'Suporte 24/7', 'Analytics avançado', 'API privada'],
  },
  enterprise: {
    name: 'Enterprise',
    price_cents: 19990,
    price_display: 'R$ 199,90',
    monthly_summary_limit: 9999,
    features: ['Resumos ilimitados', 'Canais ilimitados', 'WhatsApp integrado', 'Suporte dedicado', 'Analytics enterprise', 'API privada', 'White label'],
  },
}

// ===================================
// EXTENDED TYPES WITH RELATIONSHIPS
// ===================================

export interface UserWithSubscription extends User {
  subscription: Subscription | null
  global_channels: UserGlobalChannel[]
  can_add_channel: boolean
  can_generate_summary: boolean
}

export interface GlobalChannelWithSubscribers extends GlobalYouTubeChannel {
  subscribers: UserChannelSubscription[]
  subscriber_count_active: number
  recent_videos: GlobalProcessedVideo[]
}

export interface GlobalVideoWithNotifications extends GlobalProcessedVideo {
  channel: GlobalYouTubeChannel
  notifications: UserVideoNotification[]
  notification_count: number
  sent_count: number
}

export interface UserNotificationWithVideo extends UserVideoNotification {
  video: GlobalProcessedVideo
  channel: GlobalYouTubeChannel
}

// ===================================
// API REQUEST/RESPONSE TYPES
// ===================================

export interface AddChannelRequest {
  youtube_channel_id: string
  channel_name: string
  channel_url: string
  channel_description?: string
  subscriber_count?: number
  video_count?: number
}

export interface AddChannelResponse {
  success: boolean
  global_channel_id?: string
  subscription_id?: string
  error?: string
}

export interface ProcessVideoRequest {
  global_channel_id: string
  video_id: string
  video_title: string
  video_url: string
  video_description?: string
  video_duration?: string
  published_at?: string
  transcript?: string
  summary?: string
}

export interface ProcessVideoResponse {
  success: boolean
  processed_video_id?: string
  notification_count?: number
  error?: string
}

export interface GenerateSummaryRequest {
  user_id: string
  video_transcript: string
  video_title: string
  video_description?: string
}

export interface GenerateSummaryResponse {
  success: boolean
  summary?: string
  used_summaries?: number
  remaining_summaries?: number
  error?: string
}

// ===================================
// DASHBOARD/UI TYPES
// ===================================

export interface DashboardStats {
  total_channels: number
  total_videos_processed: number
  monthly_summaries_used: number
  monthly_summaries_limit: number
  notifications_pending: number
  last_activity: string
}

export interface ChannelStats {
  channel_id: string
  channel_name: string
  videos_processed: number
  last_video_date: string
  subscriber_count: number
  is_active: boolean
}

export interface UsageStats {
  current_month: {
    summaries_used: number
    summaries_limit: number
    percentage_used: number
  }
  extra_summaries: number
  reset_date: string
  plan_name: string
}

// ===================================
// WEBHOOK/INTEGRATION TYPES
// ===================================

export interface StripeWebhookEvent {
  type: string
  data: {
    object: {
      id: string
      customer: string
      status: SubscriptionStatus
      current_period_start: number
      current_period_end: number
      trial_end?: number
      metadata?: Record<string, string>
    }
  }
}

export interface YouTubeVideoData {
  video_id: string
  title: string
  description: string
  duration: string
  published_at: string
  channel_id: string
  thumbnail_url?: string
}

export interface WhatsAppNotification {
  user_id: string
  phone_number: string
  video_title: string
  video_url: string
  summary: string
  channel_name: string
}

// ===================================
// VALIDATION SCHEMAS (for runtime validation)
// ===================================

export const BUSINESS_TYPES: BusinessType[] = ['creator', 'business', 'personal', 'agency']
export const CONTENT_INTERESTS: ContentInterest[] = ['tech', 'business', 'entertainment', 'education', 'lifestyle', 'news', 'other']
export const SUMMARY_FREQUENCIES: SummaryFrequency[] = ['daily', 'weekly', 'monthly', 'realtime']
export const SUBSCRIPTION_STATUSES: SubscriptionStatus[] = ['incomplete', 'incomplete_expired', 'trialing', 'active', 'past_due', 'canceled', 'unpaid']

// ===================================
// ERROR TYPES
// ===================================

export interface DatabaseError {
  code: string
  message: string
  details?: string
  hint?: string
}

export interface ApiError {
  error: string
  message: string
  code?: string
  status: number
}

// ===================================
// UTILITY TYPES
// ===================================

export type CreateUserChannelSubscription = TablesInsert<'user_channel_subscriptions'>
export type UpdateUserChannelSubscription = TablesUpdate<'user_channel_subscriptions'>
export type CreateGlobalChannel = TablesInsert<'global_youtube_channels'>
export type UpdateGlobalChannel = TablesUpdate<'global_youtube_channels'>
export type CreateUser = TablesInsert<'users'>
export type UpdateUser = TablesUpdate<'users'>

// Function parameter types
export type AddGlobalChannelParams = Functions<'add_global_channel'>['Args']
export type ProcessGlobalVideoParams = Functions<'process_global_video'>['Args']

// ===================================
// EXPORT ALL FOR EASY IMPORTS
// ===================================

export * from './database.types'