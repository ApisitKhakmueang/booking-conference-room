import useSWR from 'swr';
import { adminService } from '@/service/booking.service';
import Swal from 'sweetalert2';
import { PaginatedBookingResponse } from '@/utils/interface/response';

export function usePaginatedUserBookings(
  userID: string | undefined, 
  page: number, 
  limit: number, 
  status: string, 
  year: number, 
  month: number
) {
  // นำ Parameter ทุกตัวมาใส่ใน Key เพื่อให้ SWR จำ Cache แยกตามเงื่อนไข (เปลี่ยนเดือน เปลี่ยนหน้า = ดึงใหม่)
  const swrKey = userID ? ['user-bookings', userID, page, limit, status, year, month] : null;

  const { data, error, isLoading, mutate } = useSWR<PaginatedBookingResponse>(
    swrKey, 
    () => adminService.fetchPaginatedUserBookings(userID as string, page, limit, status, year, month),
    {
      // 🌟 สำคัญมากสำหรับ Pagination และ Filter เพื่อไม่ให้จอกะพริบ
      keepPreviousData: true,  
      revalidateOnFocus: true, 
      dedupingInterval: 5000,
      errorRetryCount: 2,

      onError: (err) => {
        if (err.response?.status === 404) {
          Swal.fire({
            title: 'Not Found',
            text: "Bookings not found for this filter",
            icon: 'warning',
            confirmButtonColor: '#8370ff',
          });
        } else {
          Swal.fire({
            title: 'Connection Error',
            text: 'An error occurred while fetching booking history. Please try again.',
            icon: 'error',
            confirmButtonColor: '#8370ff',
          });
        }
      }
    }
  );

  return {
    bookingsData: data,
    isLoadingBookings: isLoading,
    isErrorBookings: error,
    reloadBookings: mutate
  };
}