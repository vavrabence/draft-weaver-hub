
export interface StyleInsights {
  posting_frequency?: string;
  common_themes?: string[];
  engagement_patterns?: string;
  best_posting_times?: string[];
}

export interface StyleProfile {
  status: string;
  source?: string;
  analyzed_at?: string;
  insights?: StyleInsights;
}

export function isStyleProfile(obj: any): obj is StyleProfile {
  return obj && typeof obj === 'object' && typeof obj.status === 'string';
}
