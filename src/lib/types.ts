import { Database } from './database.types'

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// User types
export type User = Tables<'users'>
export type UserWithChannels = User & {
  youtube_channels: YoutubeChannel[]
  subscriptions: Subscription[]
}

// Channel types
export type YoutubeChannel = Tables<'youtube_channels'>
export type YoutubeChannelWithVideos = YoutubeChannel & {
  processed_videos: ProcessedVideo[]
}

// Video types
export type ProcessedVideo = Tables<'processed_videos'>
export type ProcessedVideoWithChannel = ProcessedVideo & {
  youtube_channels: YoutubeChannel
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
  channels: YoutubeChannel[]
  can_add_channel: boolean
}