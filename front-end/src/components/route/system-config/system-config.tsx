"use client";
import { useEffect, useState } from 'react';
import AdvancedWindow from './advance-window';
import MaxBookingMins from './max-booking-mins';
import CheckInPolicy from './check-in-policy';
import DailyOperationalHours from './daily-operational-hours';
import { Button } from '@/components/ui/button';
import { useSystemConfig } from '@/hooks/data/useSystemConfig';
import Swal from 'sweetalert2';
import { configService } from '@/service/booking.service';

export default function OperationalControls() {
  const { config: fetchedConfig, isLoadingConfig, reloadConfig } = useSystemConfig();
  const [isOpenEdit, setIsOpenEdit] = useState(false)
  const [config, setConfig] = useState({
    maxBookingMins: 1, 
    maxAdvanceDays: 30,
    startTime: "08:00",
    endTime: "20:00",
    noShowThresholdMins: 15,
    earlyCheckInMinutes: 15
  });

  useEffect(() => {
    if (fetchedConfig) {
      setConfig({
        maxBookingMins: fetchedConfig.maxBookingMins / 60,
        maxAdvanceDays: fetchedConfig.maxAdvanceDays,
        startTime: fetchedConfig.startTime,
        endTime: fetchedConfig.endTime,
        noShowThresholdMins: fetchedConfig.noShowThresholdMins,
        earlyCheckInMinutes: fetchedConfig.earlyCheckInMinutes
      });
    }
  }, [fetchedConfig]); // ทำงานทุกครั้งที่ fetchedConfig เปลี่ยน (เช่น ตอนโหลดเสร็จครั้งแรก)

  // 4. กรณีต้องการ "Discard Changes" (ยกเลิกการแก้ไข)
  const handleDiscard = () => {
    if (fetchedConfig) {
      setConfig({
        maxBookingMins: fetchedConfig.maxBookingMins / 60,
        maxAdvanceDays: fetchedConfig.maxAdvanceDays,
        startTime: fetchedConfig.startTime,
        endTime: fetchedConfig.endTime,
        noShowThresholdMins: fetchedConfig.noShowThresholdMins,
        earlyCheckInMinutes: fetchedConfig.earlyCheckInMinutes
      });
    }

    setIsOpenEdit(false)
  };

  const handleSave = async () => {
    if (config.startTime >= config.endTime) {
      Swal.fire({
        title: 'Invalid Time',
        text: 'Commencement time must be before Conclusion time.',
        icon: 'warning',
        confirmButtonColor: '#8370ff', // สีปุ่มตาม Theme ของคุณ
      });
      return; // 🌟 2. return ออกไปเลย เพื่อไม่ให้โค้ดทำงานต่อลงไปข้างล่าง
    }

    const body = {...config, maxBookingMins: config.maxBookingMins * 60}
    try {
      const result = await configService.updateConfig(body)

      if (result.status === 200) {
        Swal.fire({
          title: 'Success',
          text: 'Create booking successfully !',
          icon: 'success',
          timer: 2000
        })

        reloadConfig();
      }
    } catch(error:any) {
      Swal.fire({
        title: 'Error',
        text: 'Failed to update configuration.',
        icon: 'error',
        confirmButtonColor: '#b495ff',
      });
    } finally {
      setIsOpenEdit(false)
    }
  }

  const componentProps = { config, setConfig, isOpenEdit }

  return (
    <div className={`w-full max-w-6xl text-sm pb-10 text-light-main dark:text-main font-sans mt-4 transition-colors ${isLoadingConfig ? 'opacity-40 pointer-none' : 'opacity-100'}`}>
      
      {/* Header */}
      <div className="flex md:flex-row flex-col justify-between md:items-center gap-3 mb-8">
        {/* <h1 className="text-4xl font-bold mb-3 tracking-tight text-light-main dark:text-main">
          Operational <span className="text-dark-purple">Controls</span>
        </h1> */}
        <p className="text-light-secondary dark:text-secondary text-lg leading-relaxed">
          Refine the velvet experience. Calibrate booking windows, grace periods, and
          operational rhythms for the elite concierge ecosystem.
        </p>

        {!isOpenEdit && (
          <div>
            <Button onClick={() => setIsOpenEdit(true)} variant="dark-purple" size="md">
              Edit Configuration
            </Button>
          </div>
        )}
      </div>

      {/* Main Grid (5 columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* 1. MaxBookingMins Limits (Spans 3 cols) */}
        <MaxBookingMins {...componentProps} />

        {/* 2. Advance Window (Spans 2 cols) */}
        <AdvancedWindow {...componentProps} />

        {/* 3. Late Arrival Policy (Spans 2 cols) */}
        <CheckInPolicy {...componentProps} />

        {/* 4. Daily Operational Hours (Spans 3 cols) */}
        <DailyOperationalHours {...componentProps} />

      </div>

      {/* Footer Actions */}
      {isOpenEdit && (
        <div className="flex justify-end items-center gap-6 mt-10">
          <Button 
            onClick={handleDiscard} variant="outline-purple" size="md">
            Discard Changes
          </Button>
          <Button onClick={handleSave} variant="dark-purple" size="md">
            Save Configuration
          </Button>
        </div>
      )}
    </div>
  );
}