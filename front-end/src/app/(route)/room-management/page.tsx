import EachPageLayout from "@/components/layout/each-page-layout"
import RoomManagement from "@/components/route/room-management"

export default function Page() {
  return (
    <EachPageLayout pageName="Room Management">
      <RoomManagement />
    </EachPageLayout>
  )
}