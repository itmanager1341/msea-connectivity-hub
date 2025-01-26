import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qvbxmnyxkmhwyfjppsoo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2Ynhtbnl4a21od3lmanBwc29vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc4NTcxMTAsImV4cCI6MjAyMzQzMzExMH0.Ej5stXQxOxWqxqVbE9Tz4p2_yQpkzHoE_kFxNQhZVeY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);