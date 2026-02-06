import EachPageLayout from "@/components/layout/each-page-layout"
import Room from "@/components/route/rooms"

export default function Page() {
  return (
    <EachPageLayout pageName="Room" className="flex flex-col gap-5">
      <Room />
    </EachPageLayout>
  )
}