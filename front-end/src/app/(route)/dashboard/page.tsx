import { createClient } from '@/utils/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const { user_metadata } = data?.claims ?? {}
 
  return (
    <div>
      <h1>Dashboard</h1>

      <div></div>

      <pre>{JSON.stringify(data?.claims, null, 2)}</pre>
      <img src={user_metadata?.avatar_url} />
    </div>
  )
}
