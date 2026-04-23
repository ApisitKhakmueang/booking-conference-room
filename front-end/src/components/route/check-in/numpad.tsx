'use client'

import { Delete } from "lucide-react"; 
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { roomService } from "@/service/booking.service";
import Swal from "sweetalert2";
import { BookingEventResponse } from "@/utils/interface/response";

interface NumpadProps {
  roomID: string | undefined;
  booking?: BookingEventResponse
}

export default function Numpad({ roomID, booking }: NumpadProps) {
  const [passcode, setPasscode] = useState<string>("");

  const handlePasscode = async (newPasscode: string) => {
    if (!roomID) {
      Swal.fire({
        title: 'Room Not Found',
        text: "Not found this room",
        icon: 'warning',
        confirmButtonColor: '#b495ff', 
      })
      return
    }

    const body = {
      passcode: newPasscode
    }

    try {
      const result = await roomService.checkinBooking(roomID, body)
      if (result.status === 200) {
        Swal.fire({
          title: 'Success',
          text: 'Enter passcode successfully !',
          icon: 'success',
          timer: 2000
        })
      }
    } catch (error:any) {
      // console.error("Error fetching room data:", error);
      if (error.response?.status === 400) {
        Swal.fire({
          title: 'Error',
          text: "Enter wrong passcode or this passcode is already used",
          icon: 'warning',
          confirmButtonColor: '#b495ff', 
        })
        return;
      }

      Swal.fire({
        title: 'Connection Error',
        text: 'An error occurred while fetching data. Please try again.',
        icon: 'error',
        confirmButtonColor: '#b495ff',
      });
    } finally {
      setPasscode(""); 
    }
  }
  
  const handleKeyPress = (num: string) => {
    if (passcode.length < 4) {
      const newPasscode = passcode + num;
      setPasscode(newPasscode);
      
      if (newPasscode.length === 4) {
        if (!booking) {
          Swal.fire({
            title: 'No Active Booking',
            text: 'There is no meeting happening right now to check into.',
            icon: 'info',
            confirmButtonColor: '#b495ff',
          });
          return setPasscode(""); 
        } 

        setTimeout(() => {
          handlePasscode(newPasscode)
        }, 300);
      }
    }
  };

  const handleDelete = () => setPasscode((prev) => prev.slice(0, -1));
  const handleClear = () => setPasscode("");

  return (
    <div className="flex flex-col gap-16">
      <div className="flex flex-col items-center gap-6">
        <p className="text-xs font-semibold tracking-[0.2em] text-gray-400 uppercase">
          Enter Passcode
        </p>
        <div className="flex gap-4">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                index < passcode.length
                  ? "bg-checkin shadow-[0_0_12px_rgba(180,149,255,0.8)]" 
                  : "bg-gray-600/50" 
              }`}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <Button
            key={num}
            onClick={() => handleKeyPress(num.toString())}
            // 🌟 เปลี่ยนพื้นหลังปุ่มเป็น bg-card และ hover:bg-hover 
            className="w-20 h-16 md:w-24 md:h-20 bg-card hover:bg-hover active:bg-sidebar rounded-xl text-xl md:text-2xl font-medium transition-colors flex items-center justify-center"
          >
            {num}
          </Button>
        ))}
        
        <Button
          onClick={handleClear}
          className="w-20 h-16 md:w-24 md:h-20 bg-card hover:bg-hover active:bg-sidebar rounded-xl text-lg md:text-xl font-medium transition-colors flex items-center justify-center text-gray-400"
        >
          C
        </Button>
        
        <Button
          onClick={() => handleKeyPress("0")}
          className="w-20 h-16 md:w-24 md:h-20 bg-card hover:bg-hover active:bg-sidebar rounded-xl text-xl md:text-2xl font-medium transition-colors flex items-center justify-center"
        >
          0
        </Button>
        
        <Button
          onClick={handleDelete}
          className="w-20 h-16 md:w-24 md:h-20 bg-card hover:bg-hover active:bg-sidebar rounded-xl text-xl md:text-2xl font-medium transition-colors flex items-center justify-center text-[#ff9e9e]"
        >
          <Delete className="w-6 h-6" />
        </Button>
      </div>
    </div>
  )
}