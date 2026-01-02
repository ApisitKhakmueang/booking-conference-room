import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  const { user_metadata } = data.user ?? {}
 
  return (
    <div>
      <h1>Dashboard</h1>

      <div></div>

      <pre>{JSON.stringify(data.user, null, 2)}</pre>
      <img src={user_metadata?.avatar_url} />
    </div>
  )
}
