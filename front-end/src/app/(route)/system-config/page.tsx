import EachPageLayout from "@/components/layout/each-page-layout"
import SystemConfig from "@/components/route/system-config"

export default function Page() {
  return (
    <EachPageLayout pageName="System Configuration" className="flex justify-center">
      <SystemConfig />
    </EachPageLayout>
  )
}