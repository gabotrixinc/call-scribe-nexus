
import { Json } from '@/integrations/supabase/types';

export interface Message {
  id: string;
  content: string | null;
  timestamp: string;
  direction: 'inbound' | 'outbound';
  ai_generated?: boolean;
  media_url?: string | null;
  media_type?: string | null;
  wa_message_id?: string;
  conversation_id?: string;
}

export interface TemplateVariable {
  name: string;
  type: 'text' | 'currency' | 'date_time';
  example: string;
}

export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  category: string;
  status: 'approved' | 'pending' | 'rejected';
  language: string;
  variables: TemplateVariable[];
  created_at: string;
  updated_at: string;
}

export interface WhatsappConversation {
  id: string;
  wa_phone_number: string;
  status: string;
  last_message_time: string;
  unread_count: number;
  ai_agent_id: string | null;
  contact_name?: string | null;
  contact_photo_url?: string | null;
  agents?: {
    id: string;
    name: string;
  } | null;
}

// Helper functions for type conversion between Supabase Json and our types
export const convertJsonToTemplateVariables = (jsonData: Json | null): TemplateVariable[] => {
  if (!jsonData || !Array.isArray(jsonData)) return [];
  
  return jsonData.map(item => {
    if (typeof item === 'object' && item !== null) {
      const typedItem = item as Record<string, unknown>;
      return {
        name: typeof typedItem.name === 'string' ? typedItem.name : '',
        type: typeof typedItem.type === 'string' && ['text', 'currency', 'date_time'].includes(typedItem.type as string) 
          ? (typedItem.type as 'text' | 'currency' | 'date_time') 
          : 'text',
        example: typeof typedItem.example === 'string' ? typedItem.example : ''
      };
    }
    return { name: '', type: 'text', example: '' };
  });
};

export const convertTemplateVariablesToJson = (variables: TemplateVariable[]): Json => {
  return variables as unknown as Json;
};
