import LayoutPage from "@/src/components/layout/Layout/LayoutPage"
import Card from "@/src/components/ui/Card"

const ROOM_STATUS = [
  { name: 'Available', amount: 4 },
  { name: 'Unavailable', amount: 6},
  { name: 'Total', amount: 10 }
]

export default function RoomsPage() {
  return (
    <>
      <LayoutPage pageName="Rooms">
        <div>
          Rooms Page Content

          <ul className="grid grid-cols-3 gap-6">
            {ROOM_STATUS.map((item) => (
              <Card key={item.name} variant="green" loading={false}>
                <li>
                  {item.name}: {item.amount}
                </li>
              </Card>
            ))}
          </ul>
        </div>
      </LayoutPage>
    </>
  )
}