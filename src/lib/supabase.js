import { createClient } from '@supabase/supabase-js';

// Read configuration from Vite environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase environment variables are missing! Make sure to set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
  );
}

// Initialize and export the single Supabase client instance
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
