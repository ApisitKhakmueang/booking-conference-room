import EachPageLayout from "@/components/layout/each-page-layout"
import UserManagement from "@/components/route/user-management"

export default function Page() {
  return (
    <EachPageLayout pageName="User Management">
      <UserManagement />
    </EachPageLayout>
  )
}