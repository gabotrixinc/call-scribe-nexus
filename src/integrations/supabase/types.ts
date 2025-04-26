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
      agents: {
        Row: {
          created_at: string | null
          id: string
          name: string
          prompt_template: string | null
          specialization: string | null
          status: string
          type: string
          voice_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          prompt_template?: string | null
          specialization?: string | null
          status: string
          type: string
          voice_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          prompt_template?: string | null
          specialization?: string | null
          status?: string
          type?: string
          voice_id?: string | null
        }
        Relationships: []
      }
      calls: {
        Row: {
          ai_agent_id: string | null
          caller_name: string | null
          caller_number: string
          created_at: string | null
          duration: number | null
          end_time: string | null
          human_agent_id: string | null
          id: string
          intent: string | null
          recording_url: string | null
          sentiment_score: number | null
          start_time: string
          status: string
          transcript: string | null
          twilio_call_sid: string | null
        }
        Insert: {
          ai_agent_id?: string | null
          caller_name?: string | null
          caller_number: string
          created_at?: string | null
          duration?: number | null
          end_time?: string | null
          human_agent_id?: string | null
          id?: string
          intent?: string | null
          recording_url?: string | null
          sentiment_score?: number | null
          start_time?: string
          status: string
          transcript?: string | null
          twilio_call_sid?: string | null
        }
        Update: {
          ai_agent_id?: string | null
          caller_name?: string | null
          caller_number?: string
          created_at?: string | null
          duration?: number | null
          end_time?: string | null
          human_agent_id?: string | null
          id?: string
          intent?: string | null
          recording_url?: string | null
          sentiment_score?: number | null
          start_time?: string
          status?: string
          transcript?: string | null
          twilio_call_sid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calls_ai_agent_id_fkey"
            columns: ["ai_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calls_human_agent_id_fkey"
            columns: ["human_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      quality_metrics: {
        Row: {
          call_id: string | null
          id: string
          metric_type: string
          notes: string | null
          timestamp: string
          value: number
        }
        Insert: {
          call_id?: string | null
          id?: string
          metric_type: string
          notes?: string | null
          timestamp?: string
          value: number
        }
        Update: {
          call_id?: string | null
          id?: string
          metric_type?: string
          notes?: string | null
          timestamp?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "quality_metrics_call_id_fkey"
            columns: ["call_id"]
            isOneToOne: false
            referencedRelation: "calls"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          analytics_enabled: boolean
          company_name: string
          default_greeting: string
          default_language: string
          default_voice: string
          gemini_api_key: string | null
          google_project_id: string | null
          id: string
          notifications_enabled: boolean
          pitch: number
          speaking_rate: number
          timezone: string
          tts_api_key: string | null
          twilio_account_sid: string | null
          twilio_auth_token: string | null
          twilio_phone_number: string | null
          webhook_secret: string | null
          webhook_urls: Json | null
        }
        Insert: {
          analytics_enabled?: boolean
          company_name?: string
          default_greeting?: string
          default_language?: string
          default_voice?: string
          gemini_api_key?: string | null
          google_project_id?: string | null
          id: string
          notifications_enabled?: boolean
          pitch?: number
          speaking_rate?: number
          timezone?: string
          tts_api_key?: string | null
          twilio_account_sid?: string | null
          twilio_auth_token?: string | null
          twilio_phone_number?: string | null
          webhook_secret?: string | null
          webhook_urls?: Json | null
        }
        Update: {
          analytics_enabled?: boolean
          company_name?: string
          default_greeting?: string
          default_language?: string
          default_voice?: string
          gemini_api_key?: string | null
          google_project_id?: string | null
          id?: string
          notifications_enabled?: boolean
          pitch?: number
          speaking_rate?: number
          timezone?: string
          tts_api_key?: string | null
          twilio_account_sid?: string | null
          twilio_auth_token?: string | null
          twilio_phone_number?: string | null
          webhook_secret?: string | null
          webhook_urls?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
