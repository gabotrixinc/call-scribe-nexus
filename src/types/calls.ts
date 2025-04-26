
import { Database } from '@/integrations/supabase/types';

export type CallStatus = 'active' | 'queued' | 'completed' | 'abandoned';

export type CallInsert = Database['public']['Tables']['calls']['Insert'];
export type CallRow = Database['public']['Tables']['calls']['Row'];
export type Call = CallRow;

export interface CallMetrics {
  id: string;
  timestamp: string;
  value: number;
  metric_type: string;
  notes?: string;
  call_id?: string;
}
