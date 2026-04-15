import { cn } from "@/lib/utils";
// 🌟 1. Import Select ของ Shadcn
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RoomSelectorProps } from "@/utils/interface/interface";

export default function RoomSelector({ 
  selectedRoom, 
  setSelectedRoom, 
  rooms, 
  className 
}: RoomSelectorProps) {
  
  // 🌟 2. ฟังก์ชันจับ Event เปลี่ยนห้อง (แปลงจาก String ID กลับไปเป็น Object Room)
  const handleValueChange = (roomId: string) => {
    const foundRoom = rooms.find((r) => r.id === roomId);
    if (foundRoom) {
      setSelectedRoom(foundRoom);
    }
  };

  return (
    // 🌟 3. ใช้ Shadcn UI โค้ดจะสั้นและสะอาดมาก
    <Select value={selectedRoom?.id} onValueChange={handleValueChange}>
      
      {/* ปุ่ม Trigger */}
      <SelectTrigger className={cn("w-full dark:bg-sidebar dark:border-sidebar dark:text-white focus:border-dark-purple focus:ring-1 focus:ring-dark-purple", className)}>
        {/* SelectValue จะเอา Text ข้างใน SelectItem มาโชว์ให้อัตโนมัติเลย */}
        <SelectValue placeholder="Select a room..." />
      </SelectTrigger>

      {/* ป๊อปอัป Dropdown */}
      <SelectContent className={cn(`z-110 w-(--radix-select-trigger-width) dark:bg-sidebar dark:border-sidebar max-h-[250px] text-white`)}>
        {rooms.map((room) => (
          <SelectItem 
            key={room.id} 
            value={room.id} // Shadcn รับค่าเป็น string
            className="cursor-pointer dark:focus:bg-hover dark:focus:text-white"
          >
            {room.name}
          </SelectItem>
        ))}
      </SelectContent>

    </Select>
  );
}