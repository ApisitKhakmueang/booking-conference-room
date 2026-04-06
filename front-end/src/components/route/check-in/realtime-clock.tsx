import { format } from "date-fns";
import { useEffect, useState } from "react";

export default function RealTimeClock() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-right space-y-1">
      <p className="text-sm font-medium text-gray-300">
        {format(currentTime, "EEEE, d MMMM yyyy")}
      </p>
      <p className="text-3xl font-bold text-checkin">
        {format(currentTime, "hh:mm a")}
      </p>
    </div>
  );
}