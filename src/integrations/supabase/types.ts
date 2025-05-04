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
      ai_prompt_configs: {
        Row: {
          created_at: string
          id: string
          is_default: boolean
          language: string
          max_tokens: number
          name: string
          system_prompt: string
          temperature: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean
          language?: string
          max_tokens?: number
          name: string
          system_prompt: string
          temperature?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean
          language?: string
          max_tokens?: number
          name?: string
          system_prompt?: string
          temperature?: number
          updated_at?: string
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
      contacts: {
        Row: {
          company: string | null
          created_at: string
          email: string | null
          id: string
          last_contact: string | null
          name: string
          phone: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_contact?: string | null
          name: string
          phone: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_contact?: string | null
          name?: string
          phone?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          role: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          role?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: string
        }
        Relationships: []
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
      whatsapp_config: {
        Row: {
          access_token: string | null
          business_account_id: string | null
          business_description: string | null
          created_at: string
          display_name: string | null
          id: string
          phone_number_id: string | null
          updated_at: string
          verified: boolean | null
          verify_token: string | null
          webhook_url: string | null
        }
        Insert: {
          access_token?: string | null
          business_account_id?: string | null
          business_description?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          phone_number_id?: string | null
          updated_at?: string
          verified?: boolean | null
          verify_token?: string | null
          webhook_url?: string | null
        }
        Update: {
          access_token?: string | null
          business_account_id?: string | null
          business_description?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          phone_number_id?: string | null
          updated_at?: string
          verified?: boolean | null
          verify_token?: string | null
          webhook_url?: string | null
        }
        Relationships: []
      }
      whatsapp_conversations: {
        Row: {
          ai_agent_id: string | null
          contact_name: string | null
          contact_photo_url: string | null
          created_at: string
          id: string
          last_message_time: string
          status: string
          unread_count: number
          wa_phone_number: string
        }
        Insert: {
          ai_agent_id?: string | null
          contact_name?: string | null
          contact_photo_url?: string | null
          created_at?: string
          id?: string
          last_message_time?: string
          status?: string
          unread_count?: number
          wa_phone_number: string
        }
        Update: {
          ai_agent_id?: string | null
          contact_name?: string | null
          contact_photo_url?: string | null
          created_at?: string
          id?: string
          last_message_time?: string
          status?: string
          unread_count?: number
          wa_phone_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_conversations_ai_agent_id_fkey"
            columns: ["ai_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_messages: {
        Row: {
          ai_generated: boolean | null
          content: string | null
          conversation_id: string
          direction: string
          id: string
          media_type: string | null
          media_url: string | null
          timestamp: string
          wa_message_id: string | null
        }
        Insert: {
          ai_generated?: boolean | null
          content?: string | null
          conversation_id: string
          direction: string
          id?: string
          media_type?: string | null
          media_url?: string | null
          timestamp?: string
          wa_message_id?: string | null
        }
        Update: {
          ai_generated?: boolean | null
          content?: string | null
          conversation_id?: string
          direction?: string
          id?: string
          media_type?: string | null
          media_url?: string | null
          timestamp?: string
          wa_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_templates: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          language: string
          name: string
          status: string
          updated_at: string
          variables: Json
        }
        Insert: {
          category?: string
          content: string
          created_at?: string
          id?: string
          language?: string
          name: string
          status?: string
          updated_at?: string
          variables?: Json
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          language?: string
          name?: string
          status?: string
          updated_at?: string
          variables?: Json
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
