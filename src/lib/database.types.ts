export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      conversation_logs: {
        Row: {
          context: string | null
          created_at: string | null
          id: string
          message_content: string | null
          message_type: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          context?: string | null
          created_at?: string | null
          id?: string
          message_content?: string | null
          message_type: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          context?: string | null
          created_at?: string | null
          id?: string
          message_content?: string | null
          message_type?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "active_users"
            referencedColumns: ["id"]
          },
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
          processed_at: string | null
          published_at: string | null
          sent_at: string | null
          sent_to_user: boolean | null
          summary: string | null
          transcript: string | null
          video_description: string | null
          video_duration: string | null
          video_id: string
          video_title: string
          video_url: string
        }
        Insert: {
          channel_id?: string | null
          created_at?: string | null
          id?: string
          processed_at?: string | null
          published_at?: string | null
          sent_at?: string | null
          sent_to_user?: boolean | null
          summary?: string | null
          transcript?: string | null
          video_description?: string | null
          video_duration?: string | null
          video_id: string
          video_title: string
          video_url: string
        }
        Update: {
          channel_id?: string | null
          created_at?: string | null
          id?: string
          processed_at?: string | null
          published_at?: string | null
          sent_at?: string | null
          sent_to_user?: boolean | null
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
          currency: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_name: string | null
          status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_end: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount_cents?: number | null
          created_at?: string | null
          currency?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_name?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount_cents?: number | null
          created_at?: string | null
          currency?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_name?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "active_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          description: string | null
          id: string
          setting_key: string
          setting_value: string | null
          updated_at: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          setting_key: string
          setting_value?: string | null
          updated_at?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: string | null
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
            referencedRelation: "active_users"
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
            referencedRelation: "active_users"
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
      users: {
        Row: {
          business_type: string | null
          content_interest: string | null
          created_at: string | null
          email: string | null
          extra_summaries: number | null
          id: string
          max_channels: number | null
          monthly_summary_limit: number | null
          monthly_summary_used: number | null
          name: string | null
          phone_number: string | null
          subscription_id: string | null
          subscription_status: string | null
          summary_frequency: string | null
          summary_reset_date: string | null
          trial_end_date: string | null
          updated_at: string | null
          whatsapp_validated: boolean | null
        }
        Insert: {
          business_type?: string | null
          content_interest?: string | null
          created_at?: string | null
          email?: string | null
          extra_summaries?: number | null
          id?: string
          max_channels?: number | null
          monthly_summary_limit?: number | null
          monthly_summary_used?: number | null
          name?: string | null
          phone_number?: string | null
          subscription_id?: string | null
          subscription_status?: string | null
          summary_frequency?: string | null
          summary_reset_date?: string | null
          trial_end_date?: string | null
          updated_at?: string | null
          whatsapp_validated?: boolean | null
        }
        Update: {
          business_type?: string | null
          content_interest?: string | null
          created_at?: string | null
          email?: string | null
          extra_summaries?: number | null
          id?: string
          max_channels?: number | null
          monthly_summary_limit?: number | null
          monthly_summary_used?: number | null
          name?: string | null
          phone_number?: string | null
          subscription_id?: string | null
          subscription_status?: string | null
          summary_frequency?: string | null
          summary_reset_date?: string | null
          trial_end_date?: string | null
          updated_at?: string | null
          whatsapp_validated?: boolean | null
        }
        Relationships: []
      }
      youtube_channels: {
        Row: {
          channel_description: string | null
          channel_id: string
          channel_name: string
          channel_url: string
          created_at: string | null
          id: string
          is_active: boolean | null
          last_check_at: string | null
          last_video_id: string | null
          subscriber_count: number | null
          updated_at: string | null
          user_id: string | null
          video_count: number | null
        }
        Insert: {
          channel_description?: string | null
          channel_id: string
          channel_name: string
          channel_url: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_check_at?: string | null
          last_video_id?: string | null
          subscriber_count?: number | null
          updated_at?: string | null
          user_id?: string | null
          video_count?: number | null
        }
        Update: {
          channel_description?: string | null
          channel_id?: string
          channel_name?: string
          channel_url?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_check_at?: string | null
          last_video_id?: string | null
          subscriber_count?: number | null
          updated_at?: string | null
          user_id?: string | null
          video_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "youtube_channels_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "active_users"
            referencedColumns: ["id"]
          },
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
      active_users: {
        Row: {
          channels_count: number | null
          current_period_end: string | null
          id: string | null
          max_channels: number | null
          name: string | null
          phone_number: string | null
          stripe_customer_id: string | null
          subscription_status: string | null
          user_since: string | null
        }
        Relationships: []
      }
      system_stats: {
        Row: {
          active_channels: number | null
          active_subscribers: number | null
          interactions_today: number | null
          messages_sent_today: number | null
          total_users: number | null
          videos_today: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_global_channel: {
        Args: {
          user_uuid: string
          p_youtube_channel_id: string
          p_channel_name: string
          p_channel_url: string
          p_channel_description?: string
          p_subscriber_count?: number
          p_video_count?: number
        }
        Returns: string
      }
      can_add_channel: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      can_add_global_channel: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      can_generate_summary: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      cleanup_old_logs: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_channels_to_check: {
        Args: { check_limit?: number }
        Returns: {
          channel_id: string
          user_id: string
          youtube_channel_id: string
          channel_name: string
          phone_number: string
          user_name: string
          last_video_id: string
          last_check_at: string
        }[]
      }
      get_global_channels_to_check: {
        Args: { check_limit?: number }
        Returns: {
          channel_id: string
          youtube_channel_id: string
          channel_name: string
          channel_url: string
          last_video_id: string
          last_check_at: string
          subscriber_count: number
        }[]
      }
      get_user_global_channels: {
        Args: { user_uuid: string }
        Returns: {
          subscription_id: string
          global_channel_id: string
          youtube_channel_id: string
          channel_name: string
          channel_url: string
          subscriber_count: number
          is_active: boolean
          subscribed_at: string
        }[]
      }
      get_user_status: {
        Args: { phone: string }
        Returns: Json
      }
      increment_summary_usage: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      process_global_video: {
        Args: {
          p_global_channel_id: string
          p_video_id: string
          p_video_title: string
          p_video_url: string
          p_video_description?: string
          p_video_duration?: string
          p_published_at?: string
          p_transcript?: string
          p_summary?: string
        }
        Returns: string
      }
      reactivate_channels_by_user: {
        Args: { user_uuid: string }
        Returns: number
      }
      reset_monthly_usage: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      update_channel_last_video: {
        Args: {
          channel_uuid: string
          video_id: string
          video_title: string
          video_url: string
          video_description?: string
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const