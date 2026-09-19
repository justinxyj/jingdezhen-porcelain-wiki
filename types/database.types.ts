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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      craft_media_candidates: {
        Row: {
          created_at: string
          creator: string | null
          id: string
          image_url: string
          license: string | null
          match_scope: string
          note: string | null
          process_id: string
          review_status: string
          source_tier: number | null
          source_type: string
          source_url: string
          title: string | null
        }
        Insert: {
          created_at?: string
          creator?: string | null
          id?: string
          image_url: string
          license?: string | null
          match_scope?: string
          note?: string | null
          process_id: string
          review_status?: string
          source_tier?: number | null
          source_type: string
          source_url: string
          title?: string | null
        }
        Update: {
          created_at?: string
          creator?: string | null
          id?: string
          image_url?: string
          license?: string | null
          match_scope?: string
          note?: string | null
          process_id?: string
          review_status?: string
          source_tier?: number | null
          source_type?: string
          source_url?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "craft_media_candidates_process_id_fkey"
            columns: ["process_id"]
            isOneToOne: false
            referencedRelation: "craft_processes"
            referencedColumns: ["id"]
          },
        ]
      }
      craft_process_relations: {
        Row: {
          created_at: string
          note: string | null
          process_id: string
          related_process_id: string
          relation_type: string
        }
        Insert: {
          created_at?: string
          note?: string | null
          process_id: string
          related_process_id: string
          relation_type: string
        }
        Update: {
          created_at?: string
          note?: string | null
          process_id?: string
          related_process_id?: string
          relation_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "craft_process_relations_process_id_fkey"
            columns: ["process_id"]
            isOneToOne: false
            referencedRelation: "craft_processes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "craft_process_relations_related_process_id_fkey"
            columns: ["related_process_id"]
            isOneToOne: false
            referencedRelation: "craft_processes"
            referencedColumns: ["id"]
          },
        ]
      }
      craft_processes: {
        Row: {
          category: string
          category_name: string
          created_at: string
          description_zh: string
          historical_period: string | null
          id: string
          image_creator: string | null
          image_credit: string | null
          image_license: string | null
          image_review_note: string | null
          image_search_query: string | null
          image_source_type: string
          image_source_url: string | null
          image_status: string
          image_url: string | null
          materials_zh: string | null
          name_zh: string
          output_zh: string | null
          reviewed_at: string | null
          sequence: number
          slug: string
          source_institution: string | null
          source_tier: number | null
          source_title: string | null
          source_url: string | null
          tools_zh: string | null
          updated_at: string
        }
        Insert: {
          category: string
          category_name: string
          created_at?: string
          description_zh: string
          historical_period?: string | null
          id?: string
          image_creator?: string | null
          image_credit?: string | null
          image_license?: string | null
          image_review_note?: string | null
          image_search_query?: string | null
          image_source_type?: string
          image_source_url?: string | null
          image_status?: string
          image_url?: string | null
          materials_zh?: string | null
          name_zh: string
          output_zh?: string | null
          reviewed_at?: string | null
          sequence: number
          slug: string
          source_institution?: string | null
          source_tier?: number | null
          source_title?: string | null
          source_url?: string | null
          tools_zh?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          category_name?: string
          created_at?: string
          description_zh?: string
          historical_period?: string | null
          id?: string
          image_creator?: string | null
          image_credit?: string | null
          image_license?: string | null
          image_review_note?: string | null
          image_search_query?: string | null
          image_source_type?: string
          image_source_url?: string | null
          image_status?: string
          image_url?: string | null
          materials_zh?: string | null
          name_zh?: string
          output_zh?: string | null
          reviewed_at?: string | null
          sequence?: number
          slug?: string
          source_institution?: string | null
          source_tier?: number | null
          source_title?: string | null
          source_url?: string | null
          tools_zh?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      edits: {
        Row: {
          author_id: string
          category: string
          content: string
          created_at: string
          entry_id: string | null
          id: string
          review_note: string | null
          reviewed_at: string | null
          reviewer_id: string | null
          status: string
          title: string
        }
        Insert: {
          author_id: string
          category: string
          content: string
          created_at?: string
          entry_id?: string | null
          id?: string
          review_note?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: string
          title: string
        }
        Update: {
          author_id?: string
          category?: string
          content?: string
          created_at?: string
          entry_id?: string | null
          id?: string
          review_note?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "edits_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "entries"
            referencedColumns: ["id"]
          },
        ]
      }
      entries: {
        Row: {
          category: string
          created_at: string
          en: Json
          id: string
          ja: Json
          slug: string
          sources: Json
          status: string
          updated_at: string
          updated_by: string | null
          version: number
          zh: Json
        }
        Insert: {
          category: string
          created_at?: string
          en?: Json
          id?: string
          ja?: Json
          slug: string
          sources?: Json
          status?: string
          updated_at?: string
          updated_by?: string | null
          version?: number
          zh?: Json
        }
        Update: {
          category?: string
          created_at?: string
          en?: Json
          id?: string
          ja?: Json
          slug?: string
          sources?: Json
          status?: string
          updated_at?: string
          updated_by?: string | null
          version?: number
          zh?: Json
        }
        Relationships: []
      }
      entry_craft_processes: {
        Row: {
          created_at: string
          entry_id: string
          note: string | null
          process_id: string
          relation_type: string
          reviewed_at: string | null
          source_institution: string | null
          source_tier: number | null
          source_title: string | null
          source_url: string | null
        }
        Insert: {
          created_at?: string
          entry_id: string
          note?: string | null
          process_id: string
          relation_type?: string
          reviewed_at?: string | null
          source_institution?: string | null
          source_tier?: number | null
          source_title?: string | null
          source_url?: string | null
        }
        Update: {
          created_at?: string
          entry_id?: string
          note?: string | null
          process_id?: string
          relation_type?: string
          reviewed_at?: string | null
          source_institution?: string | null
          source_tier?: number | null
          source_title?: string | null
          source_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "entry_craft_processes_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entry_craft_processes_process_id_fkey"
            columns: ["process_id"]
            isOneToOne: false
            referencedRelation: "craft_processes"
            referencedColumns: ["id"]
          },
        ]
      }
      entry_relations: {
        Row: {
          created_at: string
          entry_id: string
          note: string | null
          related_entry_id: string
          relation_type: string
        }
        Insert: {
          created_at?: string
          entry_id: string
          note?: string | null
          related_entry_id: string
          relation_type: string
        }
        Update: {
          created_at?: string
          entry_id?: string
          note?: string | null
          related_entry_id?: string
          relation_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "entry_relations_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entry_relations_related_entry_id_fkey"
            columns: ["related_entry_id"]
            isOneToOne: false
            referencedRelation: "entries"
            referencedColumns: ["id"]
          },
        ]
      }
      entry_revisions: {
        Row: {
          created_at: string
          editor_id: string
          entry_id: string
          id: string
          note: string | null
          snapshot: Json
          version: number
        }
        Insert: {
          created_at?: string
          editor_id: string
          entry_id: string
          id?: string
          note?: string | null
          snapshot: Json
          version: number
        }
        Update: {
          created_at?: string
          editor_id?: string
          entry_id?: string
          id?: string
          note?: string | null
          snapshot?: Json
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "entry_revisions_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "entries"
            referencedColumns: ["id"]
          },
        ]
      }
      entry_worlds: {
        Row: {
          created_at: string
          display_order: number
          entry_id: string
          rationale: string | null
          role: string
          world_slug: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          entry_id: string
          rationale?: string | null
          role: string
          world_slug: string
        }
        Update: {
          created_at?: string
          display_order?: number
          entry_id?: string
          rationale?: string | null
          role?: string
          world_slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "entry_worlds_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entry_worlds_world_slug_fkey"
            columns: ["world_slug"]
            isOneToOne: false
            referencedRelation: "knowledge_worlds"
            referencedColumns: ["slug"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          entry_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entry_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          entry_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "entries"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_worlds: {
        Row: {
          created_at: string
          description: string
          display_order: number
          short_title: string
          slug: string
          title: string
        }
        Insert: {
          created_at?: string
          description: string
          display_order: number
          short_title: string
          slug: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          display_order?: number
          short_title?: string
          slug?: string
          title?: string
        }
        Relationships: []
      }
      media: {
        Row: {
          canonical_key: string | null
          captured_at: string | null
          created_at: string
          creator: string | null
          entry_id: string | null
          id: string
          is_primary: boolean | null
          license: string | null
          location: string | null
          path: string
          review_state: string
          source: string | null
          source_tier: number | null
          source_type: string | null
          source_url: string | null
          status: string
          title: string | null
          uploader_id: string | null
          usage_type: string | null
          verification_note: string | null
          verified_at: string | null
        }
        Insert: {
          canonical_key?: string | null
          captured_at?: string | null
          created_at?: string
          creator?: string | null
          entry_id?: string | null
          id?: string
          is_primary?: boolean | null
          license?: string | null
          location?: string | null
          path: string
          review_state?: string
          source?: string | null
          source_tier?: number | null
          source_type?: string | null
          source_url?: string | null
          status?: string
          title?: string | null
          uploader_id?: string | null
          usage_type?: string | null
          verification_note?: string | null
          verified_at?: string | null
        }
        Update: {
          canonical_key?: string | null
          captured_at?: string | null
          created_at?: string
          creator?: string | null
          entry_id?: string | null
          id?: string
          is_primary?: boolean | null
          license?: string | null
          location?: string | null
          path?: string
          review_state?: string
          source?: string | null
          source_tier?: number | null
          source_type?: string | null
          source_url?: string | null
          status?: string
          title?: string | null
          uploader_id?: string | null
          usage_type?: string | null
          verification_note?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "entries"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      timeline_context: {
        Row: {
          ai_summary: string | null
          created_at: string
          description_source_type: string | null
          entry_id: string
          historical_role: string | null
          image_search_query: string | null
          image_source_type: string | null
          image_status: string | null
          official_image_credit: string | null
          official_image_url: string | null
          official_institution: string | null
          official_source_title: string | null
          official_source_url: string | null
          official_summary: string | null
          relationship_to_jingdezhen: string | null
          reviewed_at: string | null
          source_tier: number | null
          updated_at: string
        }
        Insert: {
          ai_summary?: string | null
          created_at?: string
          description_source_type?: string | null
          entry_id: string
          historical_role?: string | null
          image_search_query?: string | null
          image_source_type?: string | null
          image_status?: string | null
          official_image_credit?: string | null
          official_image_url?: string | null
          official_institution?: string | null
          official_source_title?: string | null
          official_source_url?: string | null
          official_summary?: string | null
          relationship_to_jingdezhen?: string | null
          reviewed_at?: string | null
          source_tier?: number | null
          updated_at?: string
        }
        Update: {
          ai_summary?: string | null
          created_at?: string
          description_source_type?: string | null
          entry_id?: string
          historical_role?: string | null
          image_search_query?: string | null
          image_source_type?: string | null
          image_status?: string | null
          official_image_credit?: string | null
          official_image_url?: string | null
          official_institution?: string | null
          official_source_title?: string | null
          official_source_url?: string | null
          official_summary?: string | null
          relationship_to_jingdezhen?: string | null
          reviewed_at?: string | null
          source_tier?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "timeline_context_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: true
            referencedRelation: "entries"
            referencedColumns: ["id"]
          },
        ]
      }
      timeline_media_candidates: {
        Row: {
          created_at: string
          creator: string | null
          entry_id: string
          id: string
          image_url: string
          license: string | null
          note: string | null
          review_status: string
          source_tier: number | null
          source_type: string
          source_url: string
          title: string | null
        }
        Insert: {
          created_at?: string
          creator?: string | null
          entry_id: string
          id?: string
          image_url: string
          license?: string | null
          note?: string | null
          review_status?: string
          source_tier?: number | null
          source_type: string
          source_url: string
          title?: string | null
        }
        Update: {
          created_at?: string
          creator?: string | null
          entry_id?: string
          id?: string
          image_url?: string
          license?: string | null
          note?: string | null
          review_status?: string
          source_tier?: number | null
          source_type?: string
          source_url?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "timeline_media_candidates_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "entries"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_staff: { Args: never; Returns: boolean }
      review_edit: {
        Args: { p_action: string; p_edit_id: string; p_note?: string }
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
