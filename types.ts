export interface OrthographicPrompts {
  [key: string]: string;
}

export interface AnalysisResponse {
  detected_orientation: string;
  missing_orientations: string[];
  prompts: OrthographicPrompts;
}

export interface GeneratedImage {
  viewName: string;
  imageUrl: string | null;
  loading: boolean;
  prompt: string;
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  REVIEW = 'REVIEW', // Analysis done, ready to generate images
  GENERATING = 'GENERATING',
  COMPLETE = 'COMPLETE'
}

export type ModelTier = 'standard' | 'pro';