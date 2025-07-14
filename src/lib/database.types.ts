export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      conversation_logs: {
        Row: {
          context: string | null
          created_at: string | null
          id: string
          message_content: string | null
          message_type: string | null
          user_id: string | null
        }
        Insert: {
          context?: string | null
          created_at?: string | null
          id?: string
          message_content?: string | null
          message_type?: string | null
          user_id?: string | null
        }
        Update: {
          context?: string | null
          created_at?: string | null
          id?: string
          message_content?: string | null
          message_type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      global_processed_videos: {
        Row: {
          created_at: string | null
          global_channel_id: string | null
          id: string
          processed_at: string | null
          published_at: string | null
          summary: string | null
          transcript: string | null
          video_description: string | null
          video_duration: string | null
          video_id: string
          video_title: string
          video_url: string
        }
        Insert: {
          created_at?: string | null
          global_channel_id?: string | null
          id?: string
          processed_at?: string | null
          published_at?: string | null
          summary?: string | null
          transcript?: string | null
          video_description?: string | null
          video_duration?: string | null
          video_id: string
          video_title: string
          video_url: string
        }
        Update: {
          created_at?: string | null
          global_channel_id?: string | null
          id?: string
          processed_at?: string | null
          published_at?: string | null
          summary?: string | null
          transcript?: string | null
          video_description?: string | null
          video_duration?: string | null
          video_id?: string
          video_title?: string
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "global_processed_videos_global_channel_id_fkey"
            columns: ["global_channel_id"]
            isOneToOne: false
            referencedRelation: "global_youtube_channels"
            referencedColumns: ["id"]
          },
        ]
      }
      global_youtube_channels: {
        Row: {
          channel_description: string | null
          channel_name: string
          channel_url: string
          created_at: string | null
          id: string
          is_active: boolean | null
          last_check_at: string | null
          last_video_id: string | null
          subscriber_count: number | null
          updated_at: string | null
          video_count: number | null
          youtube_channel_id: string
        }
        Insert: {
          channel_description?: string | null
          channel_name: string
          channel_url: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_check_at?: string | null
          last_video_id?: string | null
          subscriber_count?: number | null
          updated_at?: string | null
          video_count?: number | null
          youtube_channel_id: string
        }
        Update: {
          channel_description?: string | null
          channel_name?: string
          channel_url?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_check_at?: string | null
          last_video_id?: string | null
          subscriber_count?: number | null
          updated_at?: string | null
          video_count?: number | null
          youtube_channel_id?: string
        }
        Relationships: []
      }
      processed_videos: {
        Row: {
          channel_id: string | null
          created_at: string | null
          id: string
          published_at: string | null
          sent_to_user: boolean | null
          summary: string | null
          video_duration: string | null
          video_id: string | null
          video_title: string | null
          video_url: string | null
        }
        Insert: {
          channel_id?: string | null
          created_at?: string | null
          id?: string
          published_at?: string | null
          sent_to_user?: boolean | null
          summary?: string | null
          video_duration?: string | null
          video_id?: string | null
          video_title?: string | null
          video_url?: string | null
        }
        Update: {
          channel_id?: string | null
          created_at?: string | null
          id?: string
          published_at?: string | null
          sent_to_user?: boolean | null
          summary?: string | null
          video_duration?: string | null
          video_id?: string | null
          video_title?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "processed_videos_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "youtube_channels"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          amount_cents: number | null
          created_at: string | null
          current_period_end: string | null
          id: string
          status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          user_id: string | null
        }
        Insert: {
          amount_cents?: number | null
          created_at?: string | null
          current_period_end?: string | null
          id?: string
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          user_id?: string | null
        }
        Update: {
          amount_cents?: number | null
          created_at?: string | null
          current_period_end?: string | null
          id?: string
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          id: string
          max_channels: number | null
          name: string | null
          email: string | null
          phone_number: string | null
          subscription_status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          max_channels?: number | null
          name?: string | null
          email?: string | null
          phone_number?: string | null
          subscription_status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          max_channels?: number | null
          name?: string | null
          email?: string | null
          phone_number?: string | null
          subscription_status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_channel_subscriptions: {
        Row: {
          global_channel_id: string | null
          id: string
          is_active: boolean | null
          subscribed_at: string | null
          user_id: string | null
        }
        Insert: {
          global_channel_id?: string | null
          id?: string
          is_active?: boolean | null
          subscribed_at?: string | null
          user_id?: string | null
        }
        Update: {
          global_channel_id?: string | null
          id?: string
          is_active?: boolean | null
          subscribed_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_channel_subscriptions_global_channel_id_fkey"
            columns: ["global_channel_id"]
            isOneToOne: false
            referencedRelation: "global_youtube_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_channel_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_video_notifications: {
        Row: {
          created_at: string | null
          global_video_id: string | null
          id: string
          is_sent: boolean | null
          sent_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          global_video_id?: string | null
          id?: string
          is_sent?: boolean | null
          sent_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          global_video_id?: string | null
          id?: string
          is_sent?: boolean | null
          sent_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_video_notifications_global_video_id_fkey"
            columns: ["global_video_id"]
            isOneToOne: false
            referencedRelation: "global_processed_videos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_video_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      youtube_channels: {
        Row: {
          channel_id: string | null
          channel_name: string | null
          channel_url: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          last_video_id: string | null
          subscriber_count: number | null
          user_id: string | null
        }
        Insert: {
          channel_id?: string | null
          channel_name?: string | null
          channel_url?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_video_id?: string | null
          subscriber_count?: number | null
          user_id?: string | null
        }
        Update: {
          channel_id?: string | null
          channel_name?: string | null
          channel_url?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_video_id?: string | null
          subscriber_count?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "youtube_channels_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_add_channel: {
        Args: {
          user_uuid: string
        }
        Returns: boolean
      }
      can_add_global_channel: {
        Args: {
          user_uuid: string
        }
        Returns: boolean
      }
      get_channels_to_check: {
        Args: {
          limit_count: number
        }
        Returns: {
          channel_id: string | null
          channel_name: string | null
          channel_url: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          last_video_id: string | null
          subscriber_count: number | null
          user_id: string | null
        }[]
      }
      get_global_channels_to_check: {
        Args: {
          check_limit?: number
        }
        Returns: {
          channel_uuid: string
          youtube_channel_id: string
          channel_name: string
          last_video_id: string | null
          last_check_at: string | null
          subscriber_count: number | null
          total_users: number
        }[]
      }
      get_user_status: {
        Args: {
          phone: string
        }
        Returns: Json
      }
      process_global_video: {
        Args: {
          channel_uuid: string
          video_id: string
          video_title: string
          video_url: string
          video_description?: string
          transcript_text?: string
          summary_text?: string
          video_duration?: string
          published_at?: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}