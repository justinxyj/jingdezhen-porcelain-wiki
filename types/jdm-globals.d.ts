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
      session(): Promise<any>;
      user(): Promise<any>;
      refresh(): Promise<any>;
      request(factory: (db:any)=>Promise<any>, options?: {retryAuth?: boolean}): Promise<any>;
      signOut(): Promise<void>;
      state(): any;
    };
    JDM_KNOWLEDGE?: any;
    JDM_CONTRACT?: any;
    JDM_MEDIA_POLICY?: any;
  }
}
