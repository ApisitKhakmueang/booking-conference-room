import LayoutPage from "@/src/components/layout/Layout/LayoutPage"
import { RoomStatus, RoomsGrid } from "@/src/components/layout/Rooms"

export default function RoomsPage() {
  return (
    <>
      <LayoutPage pageName="Rooms" className="flex flex-col gap-7">
        <div>
          <RoomStatus />
        </div>

        <div>
          <RoomsGrid />
        </div>
      </LayoutPage>
    </>
  )
}