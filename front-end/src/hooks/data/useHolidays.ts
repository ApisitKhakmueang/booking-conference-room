import { useState, useEffect } from 'react';
import axios from 'axios';
import { parseISO } from 'date-fns';
import { Holiday } from '@/utils/interface/response';

export function useHolidays(startYear: string, endYear: string) {
  const [holiday, setHoliday] = useState<Holiday[] | null>(null);
  const [isLoadingHoliday, setIsLoadingHoliday] = useState(true);

  useEffect(() => {
    const fetchHolidays = async () => {
      setIsLoadingHoliday(true);
      try {
        const url = process.env.NEXT_PUBLIC_BACKEND_HTTP;
        const response = await axios.get(`${url}/holiday?startDate=${startYear}&endDate=${endYear}`);
        
        const formattedHolidays = response.data.map((h: any) => ({
          ...h,
          date: parseISO(h.date),
          updatedAt: h.updatedAt ? parseISO(h.updatedAt) : null 
        }));
        
        setHoliday(formattedHolidays);
      } catch (error) {
        console.error('Error fetching holidays:', error);
      } finally {
        setIsLoadingHoliday(false);
      }
    };

    fetchHolidays();
  }, [startYear, endYear]);

  return { holiday, isLoadingHoliday };
}