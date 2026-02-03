
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hzrdisjvscalcvgjgzig.supabase.co';
const supabaseAnonKey = 'sb_publishable_gTz-apewRlpQ-2gjuudYTw_kqJc3nL1';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
