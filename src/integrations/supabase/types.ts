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
      biographies: {
        Row: {
          created_at: string
          id: string
          progress: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          progress?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          progress?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      biography_answers: {
        Row: {
          answer_text: string | null
          biography_id: string
          id: string
          question_id: string
          updated_at: string
        }
        Insert: {
          answer_text?: string | null
          biography_id: string
          id?: string
          question_id: string
          updated_at?: string
        }
        Update: {
          answer_text?: string | null
          biography_id?: string
          id?: string
          question_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "biography_answers_biography_id_fkey"
            columns: ["biography_id"]
            isOneToOne: false
            referencedRelation: "biographies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "biography_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "biography_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      biography_chapters: {
        Row: {
          biography_id: string
          chapter_order: number
          content: string | null
          created_at: string
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          biography_id: string
          chapter_order: number
          content?: string | null
          created_at?: string
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          biography_id?: string
          chapter_order?: number
          content?: string | null
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "biography_chapters_biography_id_fkey"
            columns: ["biography_id"]
            isOneToOne: false
            referencedRelation: "biographies"
            referencedColumns: ["id"]
          },
        ]
      }
      biography_drafts: {
        Row: {
          biography_id: string
          chapter_content: Json
          created_at: string
          full_content: string
          id: string
          is_ai_generated: boolean
          updated_at: string
        }
        Insert: {
          biography_id: string
          chapter_content?: Json
          created_at?: string
          full_content: string
          id?: string
          is_ai_generated?: boolean
          updated_at?: string
        }
        Update: {
          biography_id?: string
          chapter_content?: Json
          created_at?: string
          full_content?: string
          id?: string
          is_ai_generated?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "biography_drafts_biography_id_fkey"
            columns: ["biography_id"]
            isOneToOne: false
            referencedRelation: "biographies"
            referencedColumns: ["id"]
          },
        ]
      }
      biography_questions: {
        Row: {
          created_at: string
          id: string
          question_order: number
          question_text: string
        }
        Insert: {
          created_at?: string
          id?: string
          question_order: number
          question_text: string
        }
        Update: {
          created_at?: string
          id?: string
          question_order?: number
          question_text?: string
        }
        Relationships: []
      }
      biography_settings: {
        Row: {
          biography_id: string
          created_at: string
          id: string
          language: string | null
          tone: string | null
          updated_at: string
          writing_style: string | null
        }
        Insert: {
          biography_id: string
          created_at?: string
          id?: string
          language?: string | null
          tone?: string | null
          updated_at?: string
          writing_style?: string | null
        }
        Update: {
          biography_id?: string
          created_at?: string
          id?: string
          language?: string | null
          tone?: string | null
          updated_at?: string
          writing_style?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "biography_settings_biography_id_fkey"
            columns: ["biography_id"]
            isOneToOne: true
            referencedRelation: "biographies"
            referencedColumns: ["id"]
          },
        ]
      }
      biography_toc: {
        Row: {
          approved: boolean
          biography_id: string
          created_at: string
          id: string
          structure: Json
          updated_at: string
        }
        Insert: {
          approved?: boolean
          biography_id: string
          created_at?: string
          id?: string
          structure?: Json
          updated_at?: string
        }
        Update: {
          approved?: boolean
          biography_id?: string
          created_at?: string
          id?: string
          structure?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "biography_toc_biography_id_fkey"
            columns: ["biography_id"]
            isOneToOne: true
            referencedRelation: "biographies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_biography_owner: {
        Args: { biography_id: string }
        Returns: boolean
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
