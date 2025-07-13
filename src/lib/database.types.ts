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
      get_user_status: {
        Args: {
          phone: string
        }
        Returns: Json
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