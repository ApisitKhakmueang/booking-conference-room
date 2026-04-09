import EachPageLayout from "@/components/layout/each-page-layout";
import Dashboard from "@/components/route/dashboard";

export default async function Page() {
  return (
    <EachPageLayout pageName="Dashboard">
      <Dashboard />
    </EachPageLayout>
  )
}
