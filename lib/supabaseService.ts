import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// This client has admin privileges and should ONLY be used in Server Components or API Routes.
// Never expose this to the browser.
export const supabaseAdmin = createClient(
  supabaseUrl, 
  supabaseServiceRoleKey || 'dummy-key-for-build-step', 
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
