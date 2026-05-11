import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANO)?.trim();

export const supabase = (supabaseUrl && supabaseUrl.length > 0 && supabaseAnonKey && supabaseAnonKey.length > 0)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any;
