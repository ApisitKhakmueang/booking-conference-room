'use server'

import { createClient } from '@/src/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function useSignout() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()
  redirect('/login')
}
