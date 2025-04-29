
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
