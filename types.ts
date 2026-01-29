
export type LabCategory = 'AWS' | 'Azure' | 'GCP' | 'Network' | 'AppSec' | 'Mandarin';

export type ProjectStatus = 'Completed' | 'In Progress' | 'Planned';

export interface Project {
  id: string;
  name: string;
  skills: string;
  status: ProjectStatus;
  date: string; // Added date field
  githubLink?: string;
}

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
  projects: Project[];
}

export const CATEGORIES: LabCategory[] = ['AWS', 'Azure', 'GCP', 'Network', 'AppSec', 'Mandarin'];
export const RESOURCE_TYPES: Resource['type'][] = ['Course', 'Certification', 'Doc', 'Video'];
export const PROJECT_STATUSES: ProjectStatus[] = ['Completed', 'In Progress', 'Planned'];
