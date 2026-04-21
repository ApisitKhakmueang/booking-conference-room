import useSWR from 'swr';
import { adminService } from '@/service/booking.service';
import Swal from 'sweetalert2';
import { UserOverviewResponse } from '@/utils/interface/response';

export function useUserOverview(userID: string | undefined) {
  // ใช้ Array Key และดักว่าถ้าไม่มี userID จะไม่ยิง SWR
  const swrKey = userID ? ['user-overview', userID] : null;

  const { data, error, isLoading, mutate } = useSWR<UserOverviewResponse>(
    swrKey, 
    () => adminService.fetchUserOverview(userID as string),
    {
      // ข้อมูลสถิติควร Revalidate เมื่อสลับแท็บกลับมา เพื่อให้ได้ตัวเลขล่าสุดเสมอ
      revalidateOnFocus: true, 
      dedupingInterval: 5000,
      errorRetryCount: 2,

      onError: (err) => {
        if (err.response?.status === 404) {
          console.warn("User overview not found");
        } else {
          Swal.fire({
            title: 'Connection Error',
            text: 'An error occurred while fetching user details. Please try again.',
            icon: 'error',
            confirmButtonColor: '#8370ff',
          });
        }
      }
    }
  );

  return {
    overviewData: data,
    isLoadingOverview: isLoading,
    isErrorOverview: error,
    reloadOverview: mutate
  };
}