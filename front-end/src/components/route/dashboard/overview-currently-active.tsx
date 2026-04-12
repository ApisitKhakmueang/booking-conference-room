import useBookingStatusWS from "@/hooks/data/useBookingStatusWS";
import CurrentlyActiveList from "./currently-active-list";
import RoomStatusCard from "./room-status-card";
import { useMemo } from "react";
import { DisplayRooms } from "@/lib/booking-status";
import { useRoomData } from "@/hooks/data/useRoomData";

export default function OverviewCurrentlyActive() {
  const { room: rawRoom, isLoading, isError } = useRoomData();

  const { bookings, isLoadingBooking } = useBookingStatusWS();
  const rooms = useMemo(() => {
    return DisplayRooms(rawRoom, bookings)
  }, [rawRoom, bookings])

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* 2A. Room status (Donut Charts) */}
      <RoomStatusCard rooms={rooms} />

      {/* 2B. Currently Active List */}
      <CurrentlyActiveList bookings={bookings} isLoadingBooking={isLoadingBooking} />
    </div>
  )
}