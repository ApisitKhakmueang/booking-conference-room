import EachPageLayout from "@/components/layout/each-page-layout"
import Room from "@/components/route/rooms"

export default function Page() {
  return (
    <>
      <EachPageLayout pageName="Rooms" className="flex flex-col gap-7">
        <Room />
      </EachPageLayout>
    </>
  )
}