import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Verify that URL is valid before initializing to prevent thread-crashing errors
const isClientConfigured = supabaseUrl.startsWith('http');

export const supabase = isClientConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;
