import { RoomResponse } from '@/utils/interface/response'
import { RoomState } from '@/utils/interface/stores'
import { create } from 'zustand'

export const useRoomStore = create<RoomState>()(
  (set) => ({
    rooms: null,
    setRooms: (newRooms: RoomResponse[]) => set({ rooms: newRooms }),
  })
)