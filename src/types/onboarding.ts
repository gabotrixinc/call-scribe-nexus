
export interface BusinessInfo {
  companyName: string;
  industry: string;
  description: string;
  mainGoal: string;
}

export interface OnboardingProgress {
  step: number;
  totalSteps: number;
  completed: boolean;
}

export interface AgentConfig {
  name: string;
  type: 'ai' | 'human';
  // Los valores correctos de status según el esquema de la tabla agents son:
  status: 'online' | 'offline' | 'available' | 'busy';
  specialization?: string;
  voice_id?: string;
  prompt_template?: string;
}

export interface OnboardingState {
  completed: boolean;
  businessInfo: BusinessInfo | null;
  aiPrompt: string | null;
  generatedAgents: AgentConfig[];
}
