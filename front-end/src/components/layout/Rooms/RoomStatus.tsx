import Card from "@/src/components/ui/Card"

const ROOM_STATUS = [
  { name: 'Total', amount: 10, variant: 'dark-purple' },
  { name: 'Available', amount: 4, variant: 'purple' },
  { name: 'Unavailable', amount: 5, variant: 'purple' },
  { name: 'Maintainance', amount: 1, variant: 'purple' },
] as const

export default function RoomStatus() {
  return (
    <ul className="grid md:grid-cols-4 grid-cols-2 gap-6">
      {ROOM_STATUS.map((item) => (
        <Card key={item.name} variant={item.variant} loading={false}>
          <li className='flex flex-col gap-5 xl:p-6 p-3'>
            <h1 className={`text-start font-semibold xl:text-3xl text-2xl`}>
              {item.name}
            </h1>

            <p className="text-6xl font-semibold text-center">
              {item.amount}
            </p>

            <p className="text-end text-2xl">Rooms</p>
          </li>
        </Card>
      ))}
    </ul>
  )
}