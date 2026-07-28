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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      favorites: {
        Row: {
          created_at: string
          id: string
          opportunity_data: Json | null
          opportunity_id: string
          opportunity_title: string
          opportunity_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          opportunity_data?: Json | null
          opportunity_id: string
          opportunity_title: string
          opportunity_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          opportunity_data?: Json | null
          opportunity_id?: string
          opportunity_title?: string
          opportunity_type?: string
          user_id?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          ats_identifier: string | null
          ats_metadata: Json
          ats_platform: Database["public"]["Enums"]["ats_platform"] | null
          careers_url: string | null
          consecutive_failures: number
          created_at: string
          domain: string
          id: string
          last_discovered_at: string | null
          last_error: string | null
          last_successful_sync_at: string | null
          last_synced_at: string | null
          name: string
          next_sync_at: string
          slug: string
          sync_enabled: boolean
          sync_interval_minutes: number
          sync_status: Database["public"]["Enums"]["company_sync_status"]
          tags: string[]
          updated_at: string
          website_url: string
        }
        Insert: {
          ats_identifier?: string | null
          ats_metadata?: Json
          ats_platform?: Database["public"]["Enums"]["ats_platform"] | null
          careers_url?: string | null
          consecutive_failures?: number
          created_at?: string
          domain: string
          id?: string
          last_discovered_at?: string | null
          last_error?: string | null
          last_successful_sync_at?: string | null
          last_synced_at?: string | null
          name: string
          next_sync_at?: string
          slug: string
          sync_enabled?: boolean
          sync_interval_minutes?: number
          sync_status?: Database["public"]["Enums"]["company_sync_status"]
          tags?: string[]
          updated_at?: string
          website_url: string
        }
        Update: {
          ats_identifier?: string | null
          ats_metadata?: Json
          ats_platform?: Database["public"]["Enums"]["ats_platform"] | null
          careers_url?: string | null
          consecutive_failures?: number
          created_at?: string
          domain?: string
          id?: string
          last_discovered_at?: string | null
          last_error?: string | null
          last_successful_sync_at?: string | null
          last_synced_at?: string | null
          name?: string
          next_sync_at?: string
          slug?: string
          sync_enabled?: boolean
          sync_interval_minutes?: number
          sync_status?: Database["public"]["Enums"]["company_sync_status"]
          tags?: string[]
          updated_at?: string
          website_url?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          apply_url: string
          category: string
          city: string | null
          closes_at: string | null
          company_id: string
          content_hash: string
          country: string | null
          created_at: string
          department: string | null
          description: string | null
          employment_type: string | null
          external_id: string
          first_seen_at: string
          id: string
          last_seen_at: string
          location: string | null
          posted_at: string | null
          raw_data: Json
          search_vector: unknown | null
          seniority: string | null
          source_platform: Database["public"]["Enums"]["ats_platform"]
          source_url: string | null
          status: Database["public"]["Enums"]["job_record_status"]
          team: string | null
          title: string
          updated_at: string
          workplace_type: string | null
        }
        Insert: {
          apply_url: string
          category?: string
          city?: string | null
          closes_at?: string | null
          company_id: string
          content_hash: string
          country?: string | null
          created_at?: string
          department?: string | null
          description?: string | null
          employment_type?: string | null
          external_id: string
          first_seen_at?: string
          id?: string
          last_seen_at?: string
          location?: string | null
          posted_at?: string | null
          raw_data?: Json
          search_vector?: unknown | null
          seniority?: string | null
          source_platform: Database["public"]["Enums"]["ats_platform"]
          source_url?: string | null
          status?: Database["public"]["Enums"]["job_record_status"]
          team?: string | null
          title: string
          updated_at?: string
          workplace_type?: string | null
        }
        Update: {
          apply_url?: string
          category?: string
          city?: string | null
          closes_at?: string | null
          company_id?: string
          content_hash?: string
          country?: string | null
          created_at?: string
          department?: string | null
          description?: string | null
          employment_type?: string | null
          external_id?: string
          first_seen_at?: string
          id?: string
          last_seen_at?: string
          location?: string | null
          posted_at?: string | null
          raw_data?: Json
          search_vector?: unknown | null
          seniority?: string | null
          source_platform?: Database["public"]["Enums"]["ats_platform"]
          source_url?: string | null
          status?: Database["public"]["Enums"]["job_record_status"]
          team?: string | null
          title?: string
          updated_at?: string
          workplace_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunities: {
        Row: {
          apply_url: string
          created_at: string
          created_by: string | null
          deadline: string
          description: string
          id: string
          is_active: boolean | null
          location: string | null
          organization: string
          prize: string | null
          source: string | null
          tags: string[] | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          apply_url: string
          created_at?: string
          created_by?: string | null
          deadline: string
          description: string
          id?: string
          is_active?: boolean | null
          location?: string | null
          organization: string
          prize?: string | null
          source?: string | null
          tags?: string[] | null
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          apply_url?: string
          created_at?: string
          created_by?: string | null
          deadline?: string
          description?: string
          id?: string
          is_active?: boolean | null
          location?: string | null
          organization?: string
          prize?: string | null
          source?: string | null
          tags?: string[] | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          interests: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          interests?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          interests?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      ats_platform:
        | "greenhouse"
        | "lever"
        | "workday"
        | "ashby"
        | "smartrecruiters"
        | "bamboohr"
        | "jobvite"
        | "teamtailor"
        | "recruitee"
        | "custom"
      company_sync_status: "pending" | "active" | "disabled" | "error"
      job_record_status: "open" | "closed" | "draft" | "archived"
      job_sync_run_status: "running" | "success" | "partial_success" | "failed"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
