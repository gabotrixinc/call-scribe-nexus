
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
  status: 'active' | 'inactive';
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
