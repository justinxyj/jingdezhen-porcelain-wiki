import type { Database, JDMRequestError } from './database.types';
import type { Entry, Media, SearchOptions, SearchPage } from './knowledge';
import type { SupabaseClient, SupabaseClientOptions, Session, User, AuthChangeEvent } from '@supabase/supabase-js';

export {};

declare global {
  const L: typeof import('leaflet');
  interface Window {
    L?:typeof import('leaflet');
    JDM_STATIC_ENTRY_SLUG?:string;
    JDM_RUNTIME_CONFIG?: {
      supabaseUrl: string;
      supabaseAnonKey: string;
    };
    supabase?: {
      createClient(url: string, key: string, options?: SupabaseClientOptions<'public'>): SupabaseClient<Database>;
    };
    JDM_AUTH?: {
      getClient(): SupabaseClient<Database>;
      esc?(s: unknown): string;
      session(): Promise<Session | null>;
      user(): Promise<User | null>;
      refresh(): Promise<Session | null>;
      request<T>(factory: (db: SupabaseClient<Database>, signal: AbortSignal) => PromiseLike<{ data: T; error?: unknown }>, options?: { retryAuth?: boolean; timeoutMs?: number; anonFallback?: boolean }): Promise<T>;
      signOut(): Promise<void>;
      safeHref(raw: unknown, options?: { allowHttp?: boolean }): string;
      describeError(error: unknown): { code: string; kind: string; message: string; action: string };
      state(): { status: string; session: Session | null; user: User | null; lastEvent: AuthChangeEvent | null };
    };
    JDM_KNOWLEDGE?: {
      kilnAtlas(options?:{limit?:number}):Promise<Entry[]>;
      all(): Promise<Entry[]>;
      get(slug: string): Promise<Entry | null>;
      list(options?: { category?: string | null; limit?: number; offset?: number }): Promise<Entry[]>;
      byCategory(category: string, limit?: number): Promise<Entry[]>;
      worlds(): Promise<Database['public']['Tables']['knowledge_worlds']['Row'][]>;
      byWorld(worldSlug: string, options?: { limit?: number; role?: string | null }): Promise<unknown[]>;
      worldOverview(worldSlug: string, options?: { limit?: number; featured?: number }): Promise<unknown>;
      entryContext(entryId: string, options?: { relationLimit?: number }): Promise<{relations: import('./knowledge').Relation[]; related: number; truncated?: boolean; limit?: number; error?: unknown}>;
      entryNetworkContext(entryId: string, options?: { timelineLimit?: number; spaceLimit?: number }): Promise<import('./knowledge').NetworkContext|null>;
      craftProcesses(options?: { limit?: number }): Promise<import('./knowledge').Craft[]>;
      craftProcessContext(processId: string, options?: { entryLimit?: number; relationLimit?: number }): Promise<import('./knowledge').CraftContext|null>;
      objectAtlas(options?: { limit?: number }): Promise<import('./knowledge').ObjectAtlas[]>;
      personAtlas(options?: { limit?: number }): Promise<import('./knowledge').PersonAtlas[]>;
      graph(options?: { nodeType?: string | null; nodeId?: string | null; limit?: number; edgeLimit?: number; includeEdges?: boolean }): Promise<{nodes:import('./knowledge').GraphNode[],edges:import('./knowledge').GraphEdge[]}>;
      recommendations(entryId: string, options?: { limit?: number }): Promise<import('./knowledge').Recommendation[]>;
      eraGroup(entry: Entry, timeline?: import('./knowledge').TimelinePoint | null): string;
      searchEntries(term: string, options?: SearchOptions): Promise<Entry[]>;
      searchDiscovery(term: string, options?: SearchOptions): Promise<Entry[]>;
      searchDiscoveryPage(term: string, options?: SearchOptions): Promise<SearchPage>;
      url(entry: { category: string; slug: string }): string;
      state(): { status: string; error: unknown; updatedAt: number | null };
      personImportance(entry:import('./knowledge').Entry):string;normalizeSearch(value:unknown):string;suggestSearch(query:string):string|null;
      reset(): void;
    };
    JDM_VISITOR?: {loadData():Promise<NonNullable<Window['JDM_KNOWLEDGE']>>;dialog(title:string):HTMLDialogElement;root:string;openSearch():void;renderState(host:Element,kind:'loading'|'error'|'empty',options?:{message?:string;error?:unknown;retry?:()=>void}):void};
    JDM_SOURCE_REFERENCES?: Record<string,import('./knowledge').Source>;
    JDM_CONTRACT?: {
      entry(value: unknown): Entry;
      media(value: unknown): Media;
      entries(value: unknown[]): Entry[];
      mediaList(value: unknown[]): Media[];
      world(value: unknown): Database['public']['Tables']['knowledge_worlds']['Row'];
      worlds(value: unknown[]): Database['public']['Tables']['knowledge_worlds']['Row'][];
    };
    JDM_SAFE?: {
      esc(s: unknown): string;
      safeHref(raw: unknown, options?: { allowHttp?: boolean }): string;
      sanitizeBodyHtml(raw: unknown): string;
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