
export type LabCategory = 'AWS' | 'Azure' | 'GCP' | 'Network' | 'AppSec' | 'Mandarin';

export interface Lab {
  id: string;
  name: string;
  category: LabCategory;
  githubLink: string;
  timestamp: string; // ISO string
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Resource {
  id: string;
  title: string;
  type: 'Course' | 'Certification' | 'Doc' | 'Video';
  link: string;
  completed: boolean;
}

export interface AppState {
  syncPercentage: number;
  labs: Lab[];
  maintenanceMode: boolean;
  lastDecayTimestamp: string;
  journeyStartDate: string;
  streak: number;
  lastStreakUpdateDate: string | null;
  securityChecklist: ChecklistItem[];
  resourceVault: Resource[];
}

export const CATEGORIES: LabCategory[] = ['AWS', 'Azure', 'GCP', 'Network', 'AppSec', 'Mandarin'];
export const RESOURCE_TYPES: Resource['type'][] = ['Course', 'Certification', 'Doc', 'Video'];
