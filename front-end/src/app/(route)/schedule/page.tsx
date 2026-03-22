import EachPageLayout from "@/components/layout/each-page-layout";
import Booking from "@/components/route/schedule";

export default function Page() {
  return (
    <EachPageLayout pageName="Schedule">
      <Booking />
    </EachPageLayout>
  )
}