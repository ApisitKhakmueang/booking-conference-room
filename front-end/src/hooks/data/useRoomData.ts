import useSWR from 'swr';
import { bookingService } from '@/service/booking.service';
import Swal from 'sweetalert2';
import { RoomResp } from '@/utils/interface/response';

export function useRoomData() {
  const { data, error, isLoading, mutate } = useSWR<RoomResp[]>(
    'room-details', 
    () => bookingService.fetchRoomDetails(),
    {
      // 🌟 1. ตั้งค่าการอัปเดตข้อมูลอัตโนมัติ (Background Sync)
      revalidateOnFocus: true, // สลับแท็บกลับมา ดึงข้อมูลใหม่ทันที
      refreshInterval: 60000,  // ดึงข้อมูลใหม่ทุกๆ 1 นาที
      dedupingInterval: 10000, // ป้องกันการยิง API ซ้ำซ้อนใน 10 วินาที

      // 🌟 2. จัดการ Error พร้อมป้องกัน Pop-up สแปม
      errorRetryCount: 2, // ถ้าพัง ให้ลองยิงซ้ำแค่ 2 ครั้งพอ จะได้ไม่เด้ง Swal รัวๆ ตลอดกาล
      
      onError: (err) => {
        if (err.response?.status === 404) {
          Swal.fire({
            title: 'Room Not Found',
            text: "Not found this room",
            icon: 'warning',
            confirmButtonColor: '#8370ff',
          });
        } else {
          Swal.fire({
            title: 'Connection Error',
            text: 'An error occurred while fetching data. Please try again.',
            icon: 'error',
            confirmButtonColor: '#8370ff',
          });
        }
      }
    }
  );

  return {
    room: data,      // ส่ง data ออกไปในชื่อ room
    isLoading,
    isError: error,
    reloadRoom: mutate // ส่งฟังก์ชัน mutate ออกไปเผื่ออยากกดปุ่ม Refresh มือ
  };
}