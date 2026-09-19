export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type EntryStatus = 'draft' | 'published' | 'archived';
export type MediaReviewState = 'pending' | 'verified' | 'rejected';
export type MediaStatus = 'pending' | 'approved' | 'rejected';
export type UserRole = 'user' | 'reviewer' | 'admin';

export interface Entry {
  id: string;
  slug: string;
  category: string;
  zh: Record<string, Json>;
  en: Record<string, Json>;
  ja: Record<string, Json>;
  sources: Json[];
  status: EntryStatus;
  version: number;
  updated_by?: string | null;
  created_at?: string;
  updated_at: string;
}

export interface Media {
  id: string;
  entry_id: string | null;
  path: string;
  title: string | null;
  source: string | null;
  license: string | null;
  creator: string | null;
  captured_at: string | null;
  location: string | null;
  created_at: string;
  usage_type: string | null;
  source_tier: number | null;
  is_primary: boolean;
  canonical_key: string | null;
  source_url: string | null;
  source_type: string | null;
}

export interface TimelineContext {
  entry_id: string;
  historical_role: string | null;
  relationship_to_jingdezhen: string | null;
  official_summary: string | null;
  official_image_url: string | null;
  official_image_credit: string | null;
  official_source_title: string | null;
  official_source_url: string | null;
  official_institution: string | null;
  source_tier: number | null;
  reviewed_at: string | null;
}

export interface EntryRelation {
  entry_id: string;
  related_entry_id: string;
  relation_type: 'related' | 'person' | 'object' | 'kiln' | 'craft' | 'period' | 'source';
  note: string | null;
}

export interface CraftProcess {
  id: string;
  sequence: number;
  slug: string;
  name_zh: string;
  category: string;
  category_name: string;
  description_zh: string;
  historical_period: string | null;
  tools_zh: string | null;
  materials_zh: string | null;
  output_zh: string | null;
  source_title: string | null;
  source_url: string | null;
  source_institution: string | null;
  source_tier: number | null;
  image_url: string | null;
  image_credit: string | null;
  image_source_url: string | null;
  image_status: 'verified' | 'pending_review' | 'rejected' | string;
  image_license: string | null;
  image_creator: string | null;
}

export interface Database {
  public: {
    Tables: {
      entries: { Row: Entry };
      media: { Row: Media };
      timeline_context: { Row: TimelineContext };
      entry_relations: { Row: EntryRelation };
      craft_processes: { Row: CraftProcess };
    };
  };
}

export type JDMRequestErrorCode =
  | 'AUTH_EXPIRED'
  | 'AUTH_FORBIDDEN'
  | 'AUTH_REQUIRED'
  | 'JDM_CONFIG_MISSING'
  | 'JDM_ENTRY_CONTRACT'
  | 'JDM_MEDIA_CONTRACT'
  | 'JDM_PAGE_LIMIT'
  | 'RATE_LIMITED'
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'JDM_REQUEST_ERROR';

export interface JDMRequestError extends Error {
  code: JDMRequestErrorCode;
  status: number;
  kind: 'auth' | 'forbidden' | 'config' | 'network' | 'timeout' | 'server';
  cause?: unknown;
  details?: unknown;
}

export interface TimelineMeta {
  period?: string;
  timeline_sort_year?: number;
  timeline?: Array<{ era?: string; lane?: 'jdz' | 'china' | 'world' }>;
}
