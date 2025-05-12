
export interface TranscriptionItem {
  id: string;
  call_id: string;
  text: string;
  timestamp: string;
  source: 'ai' | 'human';
  created_at?: string;
}
