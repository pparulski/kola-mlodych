import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://zhxajqfwzevtrazipwlg.supabase.co"
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoeGFqcWZ3emV2dHJhemlwd2xnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY4NjkyNDksImV4cCI6MjA1MjQ0NTI0OX0.6d3DLGKAI02AQIhgSTA4Knd3f_YF-Dp4RpGcu19NyaQ";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);