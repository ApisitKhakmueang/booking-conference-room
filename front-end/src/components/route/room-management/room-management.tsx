"use client";
import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { RoomResp } from '@/utils/interface/response';
import { Button } from '@/components/ui/button';
import StatusSection from './status-section';
import RoomList from './room-list';
import { useRoomData } from '@/hooks/data/useRoomData';
import RoomModal from './room-modal';

export default function RoomManagement() {
  const { room: rawRoom, isLoading, reloadRoom } = useRoomData();
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

  const modalProps = { typeOperate, isModalOpen, setIsModalOpen, selectedRoom, reloadRoom }

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
      <RoomList rooms={room} handleEditClick={handleEditClick} reloadRoom={reloadRoom} />
      
      <RoomModal {...modalProps} />
    </div>
  );
}