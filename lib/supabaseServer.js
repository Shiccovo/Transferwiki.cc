import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export function createServerClient(req, res) {
  return createPagesServerClient({ req, res });
} 