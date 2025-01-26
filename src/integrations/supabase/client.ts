import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qvbxmnyxkmhwyfjppsoo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2Ynhtbnl4a21od3lmanBwc29vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY4ODg3MDcsImV4cCI6MjA1MjQ2NDcwN30.sKtBMH0DBoLHrzK1VUdzHJEu4CpTnkanOdu-P4ebBWQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});