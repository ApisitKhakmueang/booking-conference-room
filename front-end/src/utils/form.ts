import { add, format } from "date-fns";
import { BodyBooking } from "./interface/form";

export const bodyBooking = (formData: BodyBooking) => {
  const start = formData.startTime
  const end = formData.endTime
  const [startHour, startMin] = start.split(":").map(Number);
  const [endHour, endMin] = end.split(":").map(Number);
  // console.log("date: ", formData.date)

  const startTime = add(formData.date, {
    hours: startHour,
    minutes: startMin
  });
  const endTime = add(formData.date, {
    hours: endHour,
    minutes: endMin
  });

  return {
    title: formData.title,
    startTime: format(startTime, "yyyy-MM-dd'T'HH:mm:ssXXX"),
    endTime: format(endTime, "yyyy-MM-dd'T'HH:mm:ssXXX"),
  }
}