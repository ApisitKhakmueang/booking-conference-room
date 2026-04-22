'use client'

import { Button } from '@/components/ui/button';
import { signOut } from '@/lib/auth';
import { Lock, LogOut } from 'lucide-react';
import { useState } from 'react';

export default function Suspended() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    
    // หน่วงเวลา UX (อธิบายเหตุผลด้านล่าง)
    setTimeout(() => {
      signOut()
    }, 800);
  };

  return (
    // 🌟 1. ปรับพื้นหลังและสีตัวอักษรหลักตาม Theme
    <div className="min-h-screen bg-light-main-background dark:bg-main-background text-light-main dark:text-main flex flex-col font-sans selection:bg-dark-purple selection:text-white">
      <main className="flex-1 flex flex-col items-center justify-center px-4 w-full max-w-2xl mx-auto -mt-10">
        
        {/* 🌟 2. ไอคอนกุญแจ: ใช้พื้นหลัง Sidebar และสี Danger จาก Theme */}
        <div className="bg-light-sidebar dark:bg-sidebar border border-gray-100 dark:border-none p-5 rounded-2xl mb-8 shadow-sm dark:shadow-inner">
          <Lock className="w-10 h-10 text-danger" strokeWidth={2} />
        </div>

        {/* 🌟 3. หัวข้อ: ใช้สี Main */}
        <h1 className="text-4xl md:text-[2.75rem] font-bold mb-4 text-center leading-tight tracking-tight text-light-main dark:text-main">
          Your account has been <br className="hidden sm:block" /> suspended
        </h1>

        {/* 🌟 4. คำอธิบาย: ใช้สี Secondary */}
        <p className="text-light-secondary dark:text-secondary text-center max-w-md mb-10 text-base md:text-lg leading-relaxed">
          Please contact administration for further details <br className="hidden sm:block" /> regarding your account status.
        </p>

        {/* Sign Out Button */}
        <Button
          onClick={handleSignOut}
          disabled={isLoggingOut}
          variant='dark-purple'
          className="flex items-center justify-center gap-2 w-full max-w-[320px] py-3.5 rounded-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed mb-8 cursor-pointer shadow-md"
        >
          {isLoggingOut ? (
            <span className="flex items-center gap-2">
              {/* 🌟 5. แก้สีวงแหวนโหลดให้เป็นสีขาว (เพราะปุ่ม Dark Purple ตัวหนังสือสีขาว) */}
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Returning...
            </span>
          ) : (
            <>
              <LogOut className="w-5 h-5" /> 
              Return to Sign In
            </>
          )}
        </Button>

      </main>
    </div>
  );
}