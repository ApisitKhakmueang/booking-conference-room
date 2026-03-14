import EachPageLayout from "@/components/layout/each-page-layout"
import Calendar from "@/components/route/calendar/calendar"

export default function Page() {
  return (
    <EachPageLayout pageName="Calendar" className="flex-1 flex flex-col gap-7">
      <Calendar />
    </EachPageLayout>
  )
}