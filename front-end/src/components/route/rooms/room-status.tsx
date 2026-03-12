'use client'

import Card, { CardVariant } from "@/components/ui/card"
import { RoomResp } from "@/utils/interface/response"
import { useMemo } from "react"

const ROOM_STATUS = [
  { name: 'Total', amount: 10, variant: 'dark-purple' },
  { name: 'Available', amount: 4, variant: 'purple' },
  { name: 'Occupied', amount: 5, variant: 'purple' },
  { name: 'Maintainance', amount: 1, variant: 'purple' },
] as const

export default function RoomStatus({ displayRooms }: { displayRooms: RoomResp[] }) {
  const countAmountRoom = useMemo(() => {
    const total = displayRooms.length
    const available = displayRooms.filter((room) => room.status === 'available').length
    const occupied = displayRooms.filter((room) => room.status === 'occupied').length
    const maintenance = displayRooms.filter((room) => room.status === 'maintenance').length

    return  [
      { name: 'Total', amount: total, variant: 'dark-purple' },
      { name: 'Available', amount: available, variant: 'purple' },
      { name: 'Occupied', amount: occupied, variant: 'purple' },
      { name: 'Maintainance', amount: maintenance, variant: 'purple' },
    ]
  }, [displayRooms])

  return (
    <>
      <ul className="grid md:grid-cols-4 grid-cols-2 gap-6">
        {countAmountRoom.map((item) => (
          <Card key={item.name} variant={item.variant as CardVariant} loading={false}>
            <li className='flex flex-col gap-5 xl:p-6 p-3'>
              <h1 className={`text-start font-semibold xl:text-3xl sm:text-2xl text-lg`}>
                {item.name}
              </h1>

              <p className="text-6xl font-semibold text-center">
                {item.amount}
              </p>

              <p className="text-end sm:text-2xl text-lg">Rooms</p>
            </li>
          </Card>
        ))}
      </ul>
    </>
  )
}