"use client";
import { useState } from 'react';
import AdvancedWindow from './advance-window';
import MaxBookingMins from './max-booking-mins';
import LateArrivalPolicy from './late-arrival-policy';
import DailyOperationalHours from './daily-operational-hours';
import { Button } from '@/components/ui/button';

export default function OperationalControls() {
  const [isOpenEdit, setIsOpenEdit] = useState(false)
  const [config, setConfig] = useState({
    maxBookingMins: 1, 
    maxAdvanceDays: 30,
    startTime: "08:00",
    endTime: "20:00",
    noShowThresholdMins: 15,
  });

  const handleSave = () => {
    console.log('config: ', config)
    setIsOpenEdit(false)
  }

  return (
    <div className="w-full text-sm pb-10 text-light-main dark:text-main font-sans mt-4 transition-colors">
      
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
            <Button 
              onClick={() => setIsOpenEdit(true)}
              className="bg-dark-purple hover:bg-dark-purple/90 text-white font-semibold px-6 py-3 rounded-lg shadow-md dark:shadow-none transition-all">
              Save Configuration
            </Button>
          </div>
        )}
      </div>

      {/* Main Grid (5 columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* 1. MaxBookingMins Limits (Spans 3 cols) */}
        <MaxBookingMins config={config} setConfig={setConfig} />

        {/* 2. Advance Window (Spans 2 cols) */}
        <AdvancedWindow config={config} setConfig={setConfig} />

        {/* 3. Late Arrival Policy (Spans 2 cols) */}
        <LateArrivalPolicy config={config} setConfig={setConfig} />

        {/* 4. Daily Operational Hours (Spans 3 cols) */}
        <DailyOperationalHours config={config} setConfig={setConfig} />

      </div>

      {/* Footer Actions */}
      {isOpenEdit && (
        <div className="flex justify-end items-center gap-6 mt-10">
          <Button 
            onClick={() => setIsOpenEdit(false)}
            className="bg-transparent hover:bg-transparent text-sm font-semibold text-light-secondary dark:text-secondary hover:text-light-main dark:hover:text-main transition-colors">
            Discard Changes
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-dark-purple hover:bg-dark-purple/90 text-white font-semibold px-6 py-3 rounded-lg shadow-md dark:shadow-none transition-all">
            Save Configuration
          </Button>
        </div>
      )}
    </div>
  );
}