import type { Database, JDMRequestError } from './database.types';

export {};

declare global {
  interface Window {
    JDM_RUNTIME_CONFIG?: {
      supabaseUrl: string;
      supabaseAnonKey: string;
    };
    supabase?: {
      createClient(url: string, key: string, options?: unknown): unknown;
    };
    JDM_AUTH?: {
      getClient(): unknown;
      session(): Promise<unknown>;
      user(): Promise<unknown>;
      refresh(): Promise<unknown>;
      request<T>(factory: (db: unknown, signal: AbortSignal) => Promise<{ data: T; error?: unknown }>, options?: { retryAuth?: boolean; timeoutMs?: number }): Promise<T>;
      signOut(): Promise<void>;
      state(): unknown;
    };
    JDM_KNOWLEDGE?: {
      all(): Promise<Database['public']['Tables']['entries']['Row'][]>;
      get(slug: string): Promise<Database['public']['Tables']['entries']['Row'] | null>;
      list(options?: { category?: string | null; limit?: number; offset?: number }): Promise<unknown[]>;
      byCategory(category: string, limit?: number): Promise<unknown[]>;
      url(entry: { category: string; slug: string }): string;
      reset(): void;
    };
    JDM_CONTRACT?: {
      entry(value: unknown): Database['public']['Tables']['entries']['Row'];
      media(value: unknown): Database['public']['Tables']['media']['Row'];
      entries(value: unknown[]): Database['public']['Tables']['entries']['Row'][];
      mediaList(value: unknown[]): Database['public']['Tables']['media']['Row'][];
    };
    JDM_MEDIA_POLICY?: {
      isUsable?(media: unknown): boolean;
      isGenericPlaceholder?(media: unknown): boolean;
    };
  }
  interface Error {
    code?: string;
    status?: number;
    kind?: string;
    cause?: unknown;
    details?: unknown;
  }
  type JDMRequestErrorType = JDMRequestError;
}