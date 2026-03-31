'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { format, setMonth, setYear, getMonth, getYear } from 'date-fns';

interface MonthYearPickerProps {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December'
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 10 }, (_, i) => currentYear - i);

export default function MonthYearPicker({ currentDate, setCurrentDate }: MonthYearPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [tempMonthIdx, setTempMonthIdx] = useState(getMonth(currentDate));
  const [tempYear, setTempYear] = useState(getYear(currentDate));

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpen = () => {
    setTempMonthIdx(getMonth(currentDate));
    setTempYear(getYear(currentDate));
    setIsOpen(!isOpen);
  };

  const handleApply = () => {
    let newDate = setMonth(currentDate, tempMonthIdx);
    newDate = setYear(newDate, tempYear);
    setCurrentDate(newDate);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  return (
    <div className="relative w-fit" ref={dropdownRef}>
      
      {/* 🌟 Trigger Button */}
      <button 
        onClick={handleOpen}
        className="flex items-center gap-6 bg-light-sidebar dark:bg-sidebar border border-dark-purple/20 dark:border-white/5 hover:bg-light-purple dark:hover:bg-hover px-4 py-2.5 rounded-xl transition-all active:scale-95 cursor-pointer shadow-sm dark:shadow-none"
      >
        <div className="flex flex-col items-start">
          <span className="text-[10px] uppercase tracking-widest text-light-secondary dark:text-secondary font-bold">
            Current Period
          </span>
          <span className="font-semibold text-lg text-dark-purple dark:text-[#E2DFFF]">
            {format(currentDate, 'MMMM yyyy')}
          </span>
        </div>
        <ChevronDown className={`text-light-secondary dark:text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} size={20} />
      </button>

      {/* 🌟 Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-3 xs:w-[340px] w-[285px] bg-light-main-background dark:bg-card border border-gray-200 dark:border-white/5 rounded-2xl shadow-xl z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          <div className="flex h-80">
            {/* --- Left Column: Months --- */}
            <div className="flex-3 flex flex-col p-4 border-r border-gray-100 dark:border-white/5">
              <span className="text-[10px] text-light-muted dark:text-secondary font-bold uppercase tracking-widest mb-4 px-3">
                Select Month
              </span>
              <div className="flex-1 overflow-y-auto space-y-1 no-scrollbar">
                {MONTHS.map((month, index) => (
                  <button
                    key={month}
                    onClick={() => setTempMonthIdx(index)}
                    className={`w-full text-left px-3 py-2.5 text-sm rounded-lg transition-colors
                      ${tempMonthIdx === index 
                        ? 'text-dark-purple dark:text-white font-bold bg-light-purple dark:bg-transparent' 
                        : 'text-light-secondary dark:text-gray-400 font-medium hover:text-dark-purple dark:hover:text-gray-200 hover:bg-light-sidebar dark:hover:bg-white/5'
                      }`}
                  >
                    {month}
                  </button>
                ))}
              </div>
            </div>

            {/* --- Right Column: Years --- */}
            <div className="flex-2 flex flex-col p-4 bg-gray-50/50 dark:bg-black/20">
              <span className="text-[10px] text-light-muted dark:text-secondary font-bold uppercase tracking-widest mb-4 px-3">
                Year
              </span>
              <div className="flex-1 overflow-y-auto space-y-1 no-scrollbar">
                {YEARS.map((year) => (
                  <button
                    key={year}
                    onClick={() => setTempYear(year)}
                    className={`w-full text-center py-2.5 text-sm rounded-lg transition-all
                      ${tempYear === year 
                        ? 'bg-dark-purple dark:bg-[#2D2D35] text-white dark:text-[#C7BFFF] font-bold shadow-md dark:shadow-none' 
                        : 'text-light-secondary dark:text-gray-500 font-medium hover:text-dark-purple dark:hover:text-gray-300 hover:bg-light-sidebar dark:hover:bg-white/5'
                      }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* --- Footer --- */}
          <div className="bg-light-sidebar dark:bg-sidebar p-4 flex justify-end items-center gap-3 border-t border-gray-100 dark:border-white/5">
            <button 
              onClick={handleCancel}
              className="px-4 py-2 text-xs font-bold text-light-secondary dark:text-gray-400 hover:text-dark-purple dark:hover:text-white uppercase tracking-widest transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button 
              onClick={handleApply}
              className="px-6 py-2.5 text-xs font-bold bg-dark-purple dark:bg-light-google text-white dark:text-black hover:bg-light-hover dark:hover:bg-[#b0a7ff] rounded uppercase tracking-widest transition-colors active:scale-95 cursor-pointer shadow-md dark:shadow-none"
            >
              Apply
            </button>
          </div>

        </div>
      )}
    </div>
  );
}