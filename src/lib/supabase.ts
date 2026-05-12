import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANO)?.trim();

export const supabase = (supabaseUrl && supabaseUrl.length > 0 && supabaseAnonKey && supabaseAnonKey.length > 0)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any;

if (supabase && typeof window !== 'undefined') {
  supabase
    .channel('public:app_state_all')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'app_state' },
      (payload: any) => {
        if (payload && payload.new && payload.new.id && 'value' in payload.new) {
          const key = payload.new.id;
          const newValue = payload.new.value;
          const currentLocal = window.localStorage.getItem(key);
          const currentLocalString = currentLocal ? currentLocal : JSON.stringify(newValue);
          
          if (JSON.stringify(newValue) !== currentLocal) {
            window.localStorage.setItem(key, JSON.stringify(newValue));
            window.dispatchEvent(new Event('local-storage-sync'));
          }
        }
      }
    )
    .subscribe();
}
