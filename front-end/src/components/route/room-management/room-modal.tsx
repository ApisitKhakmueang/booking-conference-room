import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input";
import { RoomModalProps } from "@/utils/interface/interface"
import { useEffect, useRef, useState } from "react";
import StatusSelector from "./status-selector";
import Swal from "sweetalert2";
import { roomService } from "@/service/booking.service";

export default function RoomModal({ typeOperate, isModalOpen, setIsModalOpen, selectedRoom, reloadRoom }: RoomModalProps) {
  const defaultFormData = {
    name: "",
    roomNumber: 1,
    location: "",
    capacity: 4,
    status: "available"
  }
  const [formData, setFormData] = useState(defaultFormData)
  const nameRef = useRef<HTMLInputElement>(null)
  const locationRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    formData.name = nameRef.current?.value || ""
    formData.location = locationRef.current?.value || ""

    if (formData.name === '' || formData.location === '') {
      Swal.fire({
        title: 'Error',
        text: 'Please fill in all required fields.',
        icon: 'warning',
        timer: 2000
      });
      return false; // ส่ง false กลับไปเพื่อบอกว่าไม่ผ่าน
    }

    // 🌟 ใช้ Destructuring แยก status ออกมา และเก็บส่วนที่เหลือไว้ใน payload
    const { status, ...payloadWithoutStatus } = formData;

    // 🌟 เลือกว่าจะส่งข้อมูลชุดไหนไปที่ API
    const body = typeOperate === 'add' ? payloadWithoutStatus : formData;

    try {      
      // ตัวอย่างการส่ง API
      let result
      if (typeOperate === 'add') {
        result = await roomService.createRoom(body);
      } else {
        result = await roomService.updateRoom(selectedRoom?.id, body);
      }

      if (result.status === 200) {
        Swal.fire({
          title: 'Success',
          text: 'Create booking successfully !',
          icon: 'success',
          timer: 2000
        })

        if (reloadRoom) {
          reloadRoom();
        }
      }
      
      setFormData(defaultFormData);
    } catch (error:any) {
      if (error.response?.status === 409) {
        Swal.fire({
          title: 'Error',
          text: "Room number already exists.",
          icon: 'warning',
          confirmButtonColor: '#b495ff', 
        })
        return;
      }

      Swal.fire({
        title: 'Error',
        text: 'Failed to update room.',
        icon: 'error',
        confirmButtonColor: '#b495ff',
      });
    } finally {
      setIsModalOpen(false);
    }
  };

  const handleNumberKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['-', 'e', 'E', '.'].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleNumberChange = (field: keyof typeof formData, maxVal: number) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = parseInt(e.target.value);
      
      if (isNaN(val)) {
        setFormData({ ...formData, [field]: '' as any });
        return;
      }

      if (val > maxVal) val = maxVal;
      if (val < 0) val = 0;

      setFormData({ ...formData, [field]: val });
  };

  useEffect(() => {
    // 🌟 1. ฟังก์ชันครอบจักรวาล: สกัดเอาเฉพาะ "HH:mm" ไม่ว่าข้อมูลจะมาหน้าตาแบบไหน

    if (typeOperate === 'update' && selectedRoom) {
      setFormData({
        name: selectedRoom.name,
        roomNumber: selectedRoom.roomNumber,
        location: selectedRoom.location,
        capacity: selectedRoom.capacity,
        status: selectedRoom.status
      });

    } else {
      setFormData(defaultFormData);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen, typeOperate, selectedRoom]);

  return (
    <>
      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-0">
          
          {/* 1. Backdrop (พื้นหลังเบลอและมืดลง) */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsModalOpen(false)} // กดพื้นที่ว่างเพื่อปิด
          ></div>

          <form
            onSubmit={handleSubmit}
            // 🌟 1. พื้นหลังฟอร์มใช้สีขาวล้วนในโหมดสว่าง (ลบ bg-light-purple ออก)
            className="relative bg-white dark:bg-card rounded-xl shadow-2xl w-full max-w-md transform transition-all border border-gray-100 dark:border-white/10 overflow-hidden">
            
            {/* 🌟 2. Modal Header: คลีนๆ พื้นขาว ขอบล่างเทา ตัวหนังสือสีเทาเข้ม */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-sidebar bg-light-purple dark:bg-sidebar/80">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {typeOperate === 'add' ? 'New Booking' : 'Update Booking'}
              </h2>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-white/5 p-1"
              >
                <svg className="w-5 h-5 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
      
            {/* Modal Body (ส่วนฟอร์ม) */}
            <div className="px-6 py-6 space-y-4 overflow-y-auto max-h-[70vh] no-scrollbar">
                
                <div className="flex flex-col gap-4">
                  {/* Title Input */}
                  <div className="flex flex-col gap-1.5">
                    <label 
                      htmlFor="name"
                      className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Name</label>
                    <Input
                        id='name'
                        type="text"
                        ref={nameRef} 
                        maxLength={30}
                        // 🌟 3. Input: เพิ่ม Focus state สีม่วง
                        defaultValue={formData.name}
                        placeholder="Room Name..."
                      />
                  </div>

                  {/* Location Input */}
                  <div className="flex flex-col gap-1.5">
                    <label 
                      htmlFor="location"
                      className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Location</label>
                    <Input
                        id='location'
                        type="text"
                        ref={locationRef} 
                        maxLength={30}
                        // 🌟 3. Input: เพิ่ม Focus state สีม่วง
                        defaultValue={formData.location}
                        placeholder="Location..."
                      />
                  </div>

                  {/* No. Input */}
                  <div className="flex flex-col gap-1.5">
                    <label 
                      htmlFor="roomNumber"
                      className="block text-sm font-semibold text-gray-700 dark:text-gray-300">No.</label>
                    <Input
                        id='roomNumber'
                        type="number"
                        min="0"
                        max="1000"
                        onKeyDown={handleNumberKeyDown}
                        onChange={handleNumberChange('roomNumber', 1000)}
                        className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        // 🌟 3. Input: เพิ่ม Focus state สีม่วง
                        value={formData.roomNumber}
                        placeholder="Meeting with..."
                      />
                  </div>

                  {/* Capacity Input */}
                  <div className="flex flex-col gap-1.5">
                    <label 
                      htmlFor="capacity"
                      className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Capacity</label>
                    <Input
                        id='capacity'
                        type="number"
                        min="0"
                        max="15"
                        onKeyDown={handleNumberKeyDown}
                        onChange={handleNumberChange('capacity', 15)}
                        className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        // 🌟 3. Input: เพิ่ม Focus state สีม่วง
                        value={formData.capacity}
                        placeholder="Meeting with..."
                      />
                  </div>

                  {typeOperate === 'update' && (
                    <StatusSelector 
                      value={formData.status} // 🌟 1. ส่งแค่ string ไปให้
                      onChange={(val) => setFormData({ ...formData, status: val })} // 🌟 2. ส่งฟังก์ชันอัปเดตกลับมาที่ formData หลัก
                    />
                  )}
                </div>
                
            </div>
      
            {/* 🌟 5. Modal Footer: พื้นหลังสีเทาอ่อน แยกโซนกับฟอร์มชัดเจน */}
            <div className="px-6 py-4 flex justify-end gap-3 border-t border-gray-100 dark:border-sidebar bg-gray-50 dark:bg-sidebar/50">
              <Button 
                type="button"
                onClick={() => {
                  setIsModalOpen(false)
                  setFormData(defaultFormData)
                }}
                className="px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 dark:text-gray-300 dark:bg-transparent dark:border-sidebar dark:hover:bg-white/5 rounded-lg transition-colors shadow-sm"
                >
                Cancel
              </Button>
      
              {/* 🌟 6. ปุ่ม Confirm: เปลี่ยนจากสีน้ำเงินเป็นสีม่วง dark-purple แบรนด์ของคุณ */}
              <Button 
                type="submit" 
                className='px-5 py-2 text-sm font-semibold rounded-lg bg-dark-purple hover:bg-light-hover/90 dark:bg-dark-purple/90 dark:hover:bg-dark-purple text-white shadow-md transition-all'
              >
                {typeOperate === 'add' ? 'Confirm Booking' : 'Save Changes'}
              </Button>
            </div>
      
          </form>
        </div>
      )}
    </>
  )
}