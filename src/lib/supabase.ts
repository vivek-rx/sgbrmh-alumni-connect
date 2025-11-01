import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create the client only when both env vars are present. During CI/builds
// (for example on Vercel) the env vars may not be set at module-import time
// which previously caused an immediate throw and failed the build. Instead we
// export a safe client object (either a real client or a throwing Proxy) but
// keep the exported type as the Supabase client so consumers don't see `null`.
const handler: ProxyHandler<any> = {
  get() {
    throw new Error(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment (for local dev use .env.local, for Vercel use Project Settings -> Environment Variables).'
    );
  },
  apply() {
    throw new Error(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.'
    );
  },
};

const supabaseClient = supabaseUrl && supabaseAnonKey
  ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : (new Proxy({}, handler) as unknown as ReturnType<typeof createClient<Database>>);

// For ease of consumption across the app and to avoid widespread type errors
// caused by mismatched Postgrest generics in different files, export the
// runtime client as `any`. This keeps runtime safety (real client or throwing
// proxy) while avoiding build-time `never` typing issues that block deploys.
export const supabase: any = supabaseClient as unknown as any;
export default supabase;