'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface StatusPickerProps {
  currentStatus: string;
  setCurrentStatus: (status: string) => void;
}

// 🌟 กำหนดค่าและสีของแต่ละ Status ให้ตรงกับในตาราง
const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses', dot: 'bg-gray-400 dark:bg-gray-500' },
  { value: 'confirm', label: 'Confirmed', dot: 'bg-dark-purple dark:bg-purple-400 shadow-[0_0_8px_var(--color-dark-purple)]' },
  { value: 'complete', label: 'Completed', dot: 'bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_8px] shadow-emerald-500/60' },
  { value: 'cancelled', label: 'Cancelled', dot: 'bg-rose-500 dark:bg-rose-400 shadow-[0_0_8px] shadow-rose-500/60' },
  { value: 'no_show', label: 'No-Show', dot: 'bg-orange-500 dark:bg-orange-400 shadow-[0_0_8px] shadow-orange-500/60' },
];

export default function StatusPicker({ currentStatus, setCurrentStatus }: StatusPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ปิด Dropdown เมื่อคลิกที่อื่น
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (value: string) => {
    setCurrentStatus(value);
    setIsOpen(false); // เลือกปุ๊บ ปิดปั๊บ (UX ที่ดีสำหรับ List)
  };

  const activeOption = STATUS_OPTIONS.find(opt => opt.value === currentStatus) || STATUS_OPTIONS[0];

  return (
    <div className="relative w-fit" ref={dropdownRef}>
      
      {/* 🌟 Trigger Button (ดีไซน์เดียวกับ MonthYearPicker เป๊ะ) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-3 bg-light-sidebar dark:bg-sidebar border border-dark-purple/20 dark:border-white/5 hover:bg-light-purple dark:hover:bg-hover px-3 md:px-4 py-2.5 rounded-xl transition-all active:scale-95 cursor-pointer shadow-sm dark:shadow-none"
      >
        <div className="flex flex-col items-start">
          <span className="text-[10px] uppercase tracking-widest text-light-secondary dark:text-secondary font-bold whitespace-nowrap">
            Filter Status
          </span>
          {/* ❌ ของเดิมคือ <div className="flex items-center gap-2 mt-0.5"> */}
          {/* ✅ ลบ mt-0.5 ออก */}
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${activeOption.dot}`} />
            
            {/* ❌ ของเดิมมี leading-none ต่อท้าย */}
            {/* ✅ ลบ leading-none ออก เพื่อให้ความสูงบรรทัดเท่ากับ Month Picker */}
            <span className="font-semibold text-base text-dark-purple dark:text-[#E2DFFF]">
              {activeOption.label}
            </span>
          </div>
        </div>
        <ChevronDown className={`text-light-secondary dark:text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} size={20} />
      </button>

      {/* 🌟 Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full right-0 sm:left-0 mt-3 w-full sm:w-60 bg-light-main-background dark:bg-card border border-gray-200 dark:border-white/5 rounded-2xl shadow-xl z-50 flex flex-col p-2 animate-in fade-in zoom-in-95 duration-200">
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`flex items-center justify-between w-full px-3 py-3 rounded-xl transition-colors cursor-pointer
                ${currentStatus === option.value 
                  ? 'bg-light-purple dark:bg-white/5' 
                  : 'hover:bg-gray-50 dark:hover:bg-sidebar'
                }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${option.dot}`} />
                <span className={`text-sm font-medium ${currentStatus === option.value ? 'text-dark-purple dark:text-white font-bold' : 'text-light-main dark:text-gray-300'}`}>
                  {option.label}
                </span>
              </div>
              {currentStatus === option.value && (
                <Check className="w-4 h-4 text-dark-purple dark:text-purple-400" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}