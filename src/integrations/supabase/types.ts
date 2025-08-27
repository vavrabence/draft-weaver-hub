export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      drafts: {
        Row: {
          caption: string | null
          created_at: string | null
          desired_publish_at: string | null
          hashtags: string | null
          id: string
          media_path: string
          media_type: string
          metadata: Json | null
          owner: string
          status: string
          target_instagram: boolean | null
          target_tiktok: boolean | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          desired_publish_at?: string | null
          hashtags?: string | null
          id?: string
          media_path: string
          media_type: string
          metadata?: Json | null
          owner: string
          status?: string
          target_instagram?: boolean | null
          target_tiktok?: boolean | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          desired_publish_at?: string | null
          hashtags?: string | null
          id?: string
          media_path?: string
          media_type?: string
          metadata?: Json | null
          owner?: string
          status?: string
          target_instagram?: boolean | null
          target_tiktok?: boolean | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string | null
          id: string
          kind: string
          owner: string
          payload: Json | null
          ref_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          kind: string
          owner: string
          payload?: Json | null
          ref_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          kind?: string
          owner?: string
          payload?: Json | null
          ref_id?: string | null
        }
        Relationships: []
      }
      integrations: {
        Row: {
          created_at: string | null
          instagram_connected: boolean | null
          openai_configured: boolean | null
          owner: string
          tiktok_connected: boolean | null
          updated_at: string | null
          video_edit_provider: string | null
        }
        Insert: {
          created_at?: string | null
          instagram_connected?: boolean | null
          openai_configured?: boolean | null
          owner: string
          tiktok_connected?: boolean | null
          updated_at?: string | null
          video_edit_provider?: string | null
        }
        Update: {
          created_at?: string | null
          instagram_connected?: boolean | null
          openai_configured?: boolean | null
          owner?: string
          tiktok_connected?: boolean | null
          updated_at?: string | null
          video_edit_provider?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          display_name: string | null
          id: string
          style_profile: Json | null
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          id: string
          style_profile?: Json | null
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          id?: string
          style_profile?: Json | null
        }
        Relationships: []
      }
      scheduled_posts: {
        Row: {
          created_at: string | null
          draft_id: string
          external_post_id: string | null
          id: string
          platform: string
          scheduled_for: string
          status: string
        }
        Insert: {
          created_at?: string | null
          draft_id: string
          external_post_id?: string | null
          id?: string
          platform: string
          scheduled_for: string
          status?: string
        }
        Update: {
          created_at?: string | null
          draft_id?: string
          external_post_id?: string | null
          id?: string
          platform?: string
          scheduled_for?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_posts_draft_id_fkey"
            columns: ["draft_id"]
            isOneToOne: false
            referencedRelation: "drafts"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          created_at: string | null
          low_content_alert: boolean | null
          low_content_threshold: number | null
          owner: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          low_content_alert?: boolean | null
          low_content_threshold?: number | null
          owner: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          low_content_alert?: boolean | null
          low_content_threshold?: number | null
          owner?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_draft_owner: {
        Args: { draft_id: string }
        Returns: string
      }
      get_scheduled_post_owner: {
        Args: { scheduled_post_id: string }
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
