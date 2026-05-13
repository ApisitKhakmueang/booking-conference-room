import { useState, useEffect } from 'react';
import { parseISO } from 'date-fns';
import { Holiday, ParsedHoliday } from '@/utils/interface/response';
import { helperService } from '@/service/booking.service';
import Swal from 'sweetalert2';

export function useHolidays(startYear: string, endYear: string) {
  const [holiday, setHoliday] = useState<ParsedHoliday[] | null>(null);
  const [isLoadingHoliday, setIsLoadingHoliday] = useState(true);

  useEffect(() => {
    const fetchHolidays = async () => {
      setIsLoadingHoliday(true);
      try {
        const data = await helperService.fetchHolidays(startYear, endYear);
        
        const formattedHolidays: ParsedHoliday[] = data.map((h: Holiday) => ({
          ...h,
          date: parseISO(h.date),
          updatedAt: h.updatedAt ? parseISO(h.updatedAt) : null 
        }));
        
        setHoliday(formattedHolidays);
      } catch (error) {
        const err = error as { response?: { status?: number } };
        // console.error("Error fetching room data:", error);

        // 🌟 ดักเคส: ถ้า API ตอบกลับมาว่าหาห้องไม่เจอ (404)
        if (err.response?.status === 404) {
          Swal.fire({
            title: 'Holidays Not Found',
            text: "Not found holidays",
            icon: 'warning',
            confirmButtonColor: '#8370ff', // สีม่วงเข้มให้เข้าธีมเว็บ
          })
          return;
        }

        // 🌟 ดักเคส: Error อื่นๆ (เช่น เซิร์ฟเวอร์ล่ม, เน็ตหลุด)
        Swal.fire({
          title: 'Connection Error',
          text: 'An error occurred while fetching data. Please try again.',
          icon: 'error',
          confirmButtonColor: '#8370ff',
        });
      } finally {
        setIsLoadingHoliday(false);
      }
    };

    fetchHolidays();
  }, [startYear, endYear]);

  return { holiday, isLoadingHoliday };
}