import LayoutEachPage from "@/components/layout/layout-each-page"
import { RoomStatus, RoomsGrid } from "@/components/route/rooms"

export default function Page() {
  return (
    <>
      <LayoutEachPage pageName="Rooms" className="flex flex-col gap-7">
        <RoomStatus />
        <RoomsGrid />
      </LayoutEachPage>
    </>
  )
}