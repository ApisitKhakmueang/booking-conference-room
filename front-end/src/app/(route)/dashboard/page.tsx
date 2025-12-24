import { createClient } from '@/src/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  return (
    <div>
      <h1>Dashboard</h1>
      <pre>{JSON.stringify(data.user, null, 2)}</pre>
    </div>
  )
}
