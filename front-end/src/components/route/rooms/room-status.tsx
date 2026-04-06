'use client'

import { Button } from "@/components/ui/button"
import { Card, type CardProps } from "@/components/ui/card" // 🌟 Import CardProps มาด้วย
import { RoomResp } from "@/utils/interface/response"
import { CalendarDays } from "lucide-react"
import { useMemo } from "react"

const ROOM_STATUS = [
  { name: 'Total', amount: 10, variant: 'purple' },
  { name: 'Available', amount: 4, variant: 'purple' },
  { name: 'Occupied', amount: 5, variant: 'purple' },
  { name: 'Maintainance', amount: 1, variant: 'purple' },
] as const

export default function RoomStatus({ displayRooms, isLoadingBooking }: { displayRooms: RoomResp[], isLoadingBooking: boolean }) {
  const countAmountRoom = useMemo(() => {
    const total = displayRooms.length
    const available = displayRooms.filter((room) => room.status === 'available').length
    const occupied = displayRooms.filter((room) => room.status === 'occupied').length
    const maintenance = displayRooms.filter((room) => room.status === 'maintenance').length

    const result: { name: string, amount: number, variant: CardProps["variant"] }[] = [
      { name: 'Total', amount: total, variant: 'purple' },
      { name: 'Available', amount: available, variant: 'purple' },
      { name: 'Occupied', amount: occupied, variant: 'purple' },
      { name: 'Maintainance', amount: maintenance, variant: 'purple' },
    ];
    return result;
  }, [displayRooms])

  return (
    <div>
      {isLoadingBooking && (
        <div className="absolute top-2 right-4 z-10 text-xs text-blue-500 flex items-center gap-1 bg-white/80 dark:bg-black/80 px-2 py-1 rounded-full shadow">
          <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Updating...
        </div>
      )}

      <div className="flex justify-end pb-5">
        <Button  
          className="p-2 bg-transparent border border-dark-purple text-dark-purple hover:bg-dark-purple/10 dark:border-sidebar dark:text-stone-400 dark:hover:bg-sidebar/20 shadow-none text-sm font-medium cursor-pointer rounded whitespace-nowrap transition-all gap-2"
        >
          <CalendarDays className="w-4 h-4" />
          Timeline View
        </Button>
      </div>

      <ul className="grid md:grid-cols-4 grid-cols-2 gap-6">
        {countAmountRoom.map((item) => (
          <Card key={item.name} variant={item.variant} loading={false}>
            <li className='flex flex-col gap-3 xl:p-6 p-3'>
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
    </div>
  )
}