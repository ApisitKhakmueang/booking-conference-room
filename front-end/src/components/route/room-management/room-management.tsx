"use client";
import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { RoomResp } from '@/utils/interface/response';
import { Button } from '@/components/ui/button';
import StatusSection from './status-section';
import RoomList from './room-list';
import { useRoomData } from '@/hooks/data/useRoomData';
import RoomModal from './room-modal';

// Mock Data
const INITIAL_ROOMS: RoomResp[] = [
  { id: '1', name: 'Suite 01', roomNumber: 1, location: 'Primary Wing', capacity: 8, status: 'active' },
  { id: '2', name: 'Suite 02', roomNumber: 2, location: 'Creative Hub', capacity: 12, status: 'maintenance' },
  { id: '3', name: 'Suite 03', roomNumber: 3, location: 'Library Hall', capacity: 4, status: 'active' },
  { id: '4', name: 'Suite 04', roomNumber: 4, location: 'East Wing', capacity: 10, status: 'active' },
  { id: '5', name: 'Suite 05', roomNumber: 5, location: 'West Wing', capacity: 6, status: 'active' },
  { id: '6', name: 'Suite 06', roomNumber: 6, location: 'North Wing', capacity: 20, status: 'maintenance' },
];

export default function RoomManagement() {
  const { room: rawRoom, isLoading, isError, reloadRoom } = useRoomData();
  const [rooms, setRooms] = useState<RoomResp[]>(INITIAL_ROOMS);
  const [selectedRoom, setSelectedRoom] = useState<RoomResp | undefined>(undefined)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [typeOperate, setTypeOperate] = useState<'add' | 'update'>('add')

  const room = useMemo(() => {
    if (!rawRoom) return [];

    return rawRoom.sort((a, b) => a.roomNumber - b.roomNumber); // เรียงน้อยไปมาก
  }, [rawRoom])

  const handleAddClick = () => {
    setTypeOperate("add")
    setIsModalOpen(true)
    setSelectedRoom(undefined)
  }

  const handleEditClick = (event:RoomResp) => {
    setTypeOperate("update")
    setIsModalOpen(true)
    setSelectedRoom(event)
  }

  const modalProps = { typeOperate, isModalOpen, setIsModalOpen, selectedRoom }

  return (
    <div className={`w-full text-sm pb-3 ${isLoading ? 'opacity-40 pointer-none' : 'opacity-100'}`}>
      
      {/* 1. Add Button */}
      <div className="flex md:flex-row flex-col justify-between md:items-center gap-2 mb-6">
        <p className="text-light-secondary dark:text-secondary text-lg leading-relaxed">Manage and configure your meeting spaces.</p>

        <div>
          <Button variant="dark-purple" size="md" onClick={handleAddClick}>
            <Plus className="w-4 h-4" /> Add New Room
          </Button>
        </div>
      </div>

      {/* 2. Stats Section */}
      <StatusSection rooms={room} />

      {/* 3. Room List Section */}
      <RoomList rooms={room} handleEditClick={handleEditClick} />
      
      <RoomModal {...modalProps} />
    </div>
  );
}