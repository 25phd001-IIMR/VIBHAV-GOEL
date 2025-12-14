import { createClient } from '@supabase/supabase-js';

// Helper to safely access process.env
const getProcessEnv = (key: string) => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  return undefined;
};

// Check if credentials exist
const supabaseUrl = getProcessEnv('REACT_APP_SUPABASE_URL');
const supabaseKey = getProcessEnv('REACT_APP_SUPABASE_ANON_KEY');

export const isSupabaseConfigured = !!supabaseUrl && !!supabaseKey && supabaseUrl !== 'undefined';

const urlToUse = isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co';
const keyToUse = isSupabaseConfigured ? supabaseKey : 'placeholder-key';

if (!isSupabaseConfigured) {
  console.warn('Supabase credentials missing. Falling back to LocalStorage (Mock Mode).');
}

export const supabase = createClient(urlToUse as string, keyToUse as string);