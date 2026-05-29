import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ewzvcunhovwhqcqiyrbi.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3enZjdW5ob3Z3aHFjcWl5cmJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwMTUyMjQsImV4cCI6MjA5NTU5MTIyNH0.YgXUzYmtKg5dw46AKA3wj6-_aRVdh9CUdPp3X-vu0Gg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
