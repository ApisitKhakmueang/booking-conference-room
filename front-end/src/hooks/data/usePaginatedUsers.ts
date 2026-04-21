import useSWR from 'swr';
import { adminService } from '@/service/booking.service'; // แก้ path ให้ตรงกับโปรเจกต์คุณ
import Swal from 'sweetalert2';
import { PaginatedUserResponse } from '@/utils/interface/response';

export function usePaginatedUsers(page: number, limit: number, search?: string) {
  // 🌟 1. ใช้ Array เป็น Key เพื่อให้ SWR รู้ว่าถ้า page หรือ search เปลี่ยน ต้องไปดึงข้อมูลใหม่
  const swrKey = ['paginated-users', page, limit, search];

  const { data, error, isLoading, mutate } = useSWR<PaginatedUserResponse>(
    swrKey, 
    () => adminService.fetchPaginatedUsers(page, limit, search),
    {
      // 🌟 2. การตั้งค่าสำหรับ Pagination & UX
      keepPreviousData: true,  // สำคัญมาก! ทำให้ตอนกดเปลี่ยนหน้า ตารางจะไม่กะพริบเป็นหน้าขาวๆ
      revalidateOnFocus: true, // สลับแท็บกลับมา ดึงข้อมูลใหม่
      dedupingInterval: 5000,  // ป้องกันการยิง API ซ้ำใน 5 วินาที
      errorRetryCount: 2,

      // 🌟 3. จัดการ Error แบบเดียวกับไฟล์อื่นๆ
      onError: (err) => {
        if (err.response?.status === 404) {
          // ถ้ากรณีค้นหาแล้วไม่เจอ อาจจะไม่ต้องเด้ง Error แต่ปล่อยให้ตารางว่าง
          console.warn("Users not found");
        } else {
          Swal.fire({
            title: 'Connection Error',
            text: 'An error occurred while fetching users. Please try again.',
            icon: 'error',
            confirmButtonColor: '#8370ff',
          });
        }
      }
    }
  );

  return {
    usersData: data,       // ส่งคืนข้อมูลทั้งหมด (มีทั้ง data และ meta)
    isLoadingUsers: isLoading,
    isErrorUsers: error,
    reloadUsers: mutate    // เอาไว้เรียกตอนกด Toggle Active/Inactive
  };
}