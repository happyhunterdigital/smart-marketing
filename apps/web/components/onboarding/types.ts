import { ComponentType } from 'react';
import { LucideProps } from 'lucide-react';

export type RoleId = 'learner' | 'instructor' | 'organization';

export interface RoleOption {
  id: RoleId;
  title: string;
  description: string;
  icon: ComponentType<LucideProps>;
}

export interface OnboardingData {
  role: RoleId | null;
  fullName: string;
}
