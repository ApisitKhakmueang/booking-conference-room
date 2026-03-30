import { BookingEventResponse } from "@/utils/interface/response";
import { clsx, type ClassValue } from "clsx"
import { parseISO } from "date-fns/fp/parseISO";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatBookingEvent = (event: any): BookingEventResponse => {
  return {
    ...event,
    startTime: parseISO(event.startTime),
    endTime: parseISO(event.endTime),
  };
};