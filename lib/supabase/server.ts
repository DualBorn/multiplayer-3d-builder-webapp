import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// For server-side operations
export const createServerSupabaseClient = () => {
  return createServerComponentClient({ cookies })
}

