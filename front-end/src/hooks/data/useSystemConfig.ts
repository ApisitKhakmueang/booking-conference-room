import useSWR from 'swr';
import { configService } from '@/service/booking.service';
import Swal from 'sweetalert2';
// อย่าลืม import interface ของ ConfigTimeResponse ถ้าคุณมี
// import { ConfigTimeResponse } from '@/utils/interface/response';

export function useSystemConfig() {
  const { data, error, isLoading, mutate } = useSWR(
    'system-config', // Key ประจำตัวของ SWR
    () => configService.fetchConfig(),
    {
      // 🌟 ทริค: ค่า Config ปกติไม่ค่อยเปลี่ยนบ่อย อาจจะปิดการโหลดใหม่ตอนสลับแท็บเพื่อประหยัดโควต้า API
      revalidateOnFocus: false, 
      dedupingInterval: 60000, // ถ้าเรียก Hook นี้ซ้ำใน 1 นาที ให้ดึงจาก Cache แทน
      errorRetryCount: 2, // ลองโหลดใหม่แค่ 2 ครั้งถ้าพัง จะได้ไม่เด้ง Swal รัวๆ
      
      // 🌟 ย้าย Logic การแจ้งเตือน Error มาไว้ตรงนี้
      onError: (err) => {
        if (err.response?.status === 500) {
          Swal.fire({
            title: 'Error',
            text: "Date format is invalid or missing",
            icon: 'warning',
            confirmButtonColor: '#b495ff',
          });
        } else {
          Swal.fire({
            title: 'Connection Error',
            text: 'An error occurred while fetching data. Please try again.',
            icon: 'error',
            confirmButtonColor: '#b495ff',
          });
        }
      }
    }
  );

  return {
    config: data,        // คืนค่า data โดยตั้งชื่อใหม่เป็น config ให้เข้าใจง่าย
    isLoadingConfig: isLoading,
    isErrorConfig: error,
    reloadConfig: mutate // เผื่อกรณีที่คุณมีปุ่ม "Refresh" ค่า Config
  };
}