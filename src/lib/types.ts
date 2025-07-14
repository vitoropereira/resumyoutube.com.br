import { Database } from './database.types'

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// User types
export type User = Tables<'users'>

// Global structure types
export type GlobalYoutubeChannel = Tables<'global_youtube_channels'>
export type UserChannelSubscription = Tables<'user_channel_subscriptions'>
export type GlobalProcessedVideo = Tables<'global_processed_videos'>
export type UserVideoNotification = Tables<'user_video_notifications'>

// Global combined types
export type GlobalChannelWithSubscriptions = GlobalYoutubeChannel & {
  user_channel_subscriptions: UserChannelSubscription[]
}

export type GlobalVideoWithChannel = GlobalProcessedVideo & {
  global_youtube_channels: GlobalYoutubeChannel
}

export type GlobalVideoWithNotifications = GlobalProcessedVideo & {
  user_video_notifications: UserVideoNotification[]
  global_youtube_channels: GlobalYoutubeChannel
}

// User with global channels
export type UserWithGlobalChannels = User & {
  user_channel_subscriptions: (UserChannelSubscription & {
    global_youtube_channels: GlobalYoutubeChannel
  })[]
  subscriptions: Subscription[]
}


// Subscription types
export type Subscription = Tables<'subscriptions'>

// Conversation logs
export type ConversationLog = Tables<'conversation_logs'>

// Subscription status enum
export type SubscriptionStatus = 'active' | 'inactive' | 'canceled' | 'past_due' | 'incomplete'

// User status from stored procedure
export interface UserStatus {
  user: User
  subscription: Subscription | null
  channels_global: (UserChannelSubscription & {
    global_youtube_channels: GlobalYoutubeChannel
  })[]
  can_add_global_channel: boolean
  stats: {
    total_global_channels: number
    pending_notifications: number
    total_received_videos: number
  }
}