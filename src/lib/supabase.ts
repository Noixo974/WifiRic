// Use the centralized Supabase client configured with proper options
import { supabase as supabaseClient } from '../integrations/supabase/client';

export const supabase = supabaseClient as any;

