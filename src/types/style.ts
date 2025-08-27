
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
  // Core style properties from OpenAI analysis
  tone?: string;
  sentence_length?: string;
  emoji_usage?: string;
  language_mix?: string;
  hashtag_strategy?: string;
  sample_count?: number;
  structure?: string[];
  cta_patterns?: string[];
  do_nots?: string[];
}

export function isStyleProfile(obj: any): obj is StyleProfile {
  return obj && typeof obj === 'object' && typeof obj.status === 'string';
}
