import type { Database, JDMRequestError } from './database.types';

export {};

declare global {
  interface Window {
    JDM_RUNTIME_CONFIG?: {
      supabaseUrl: string;
      supabaseAnonKey: string;
    };
    supabase?: {
      createClient(url: string, key: string, options?: unknown): any;
    };
    JDM_AUTH?: {
      getClient(): any;
      session(): Promise<unknown>;
      user(): Promise<unknown>;
      refresh(): Promise<unknown>;
      request<T>(factory: (db: any, signal: AbortSignal) => Promise<{ data: T; error?: unknown }>, options?: { retryAuth?: boolean; timeoutMs?: number }): Promise<T>;
      signOut(): Promise<void>;
      state(): { status: string; session: unknown; user: unknown; lastEvent: unknown };
    };
    JDM_KNOWLEDGE?: {
      all(): Promise<Database['public']['Tables']['entries']['Row'][]>;
      get(slug: string): Promise<Database['public']['Tables']['entries']['Row'] | null>;
      list(options?: { category?: string | null; limit?: number; offset?: number }): Promise<unknown[]>;
      byCategory(category: string, limit?: number): Promise<unknown[]>;
      worlds(): Promise<Database['public']['Tables']['knowledge_worlds']['Row'][]>;
      byWorld(worldSlug: string, options?: { limit?: number; role?: string | null }): Promise<unknown[]>;
      worldOverview(worldSlug: string, options?: { limit?: number; featured?: number }): Promise<unknown>;
      entryContext(entryId: string, options?: { relationLimit?: number }): Promise<unknown>;
      entryNetworkContext(entryId: string, options?: { timelineLimit?: number; spaceLimit?: number }): Promise<unknown>;
      objectAtlas(options?: { limit?: number }): Promise<unknown[]>;
      personAtlas(options?: { limit?: number }): Promise<unknown[]>;
      graph(options?: { nodeType?: string | null; nodeId?: string | null; limit?: number; edgeLimit?: number; includeEdges?: boolean }): Promise<unknown>;
      recommendations(entryId: string, options?: { limit?: number }): Promise<unknown[]>;
      eraGroup(entry: unknown, timeline?: unknown): string;
      searchEntries(term: string, options?: unknown): Promise<unknown[]>;
      searchDiscovery(term: string, options?: unknown): Promise<unknown[]>;
      searchDiscoveryPage(term: string, options?: unknown): Promise<unknown>;
      url(entry: { category: string; slug: string }): string;
      state(): { status: string; error: unknown; updatedAt: number | null };
      reset(): void;
    };
    JDM_CONTRACT?: {
      entry(value: unknown): Database['public']['Tables']['entries']['Row'];
      media(value: unknown): Database['public']['Tables']['media']['Row'];
      entries(value: unknown[]): Database['public']['Tables']['entries']['Row'][];
      mediaList(value: unknown[]): Database['public']['Tables']['media']['Row'][];
      world(value: unknown): Database['public']['Tables']['knowledge_worlds']['Row'];
      worlds(value: unknown[]): Database['public']['Tables']['knowledge_worlds']['Row'][];
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