import { Bell } from 'lucide-react';
import Button from '../ui/Button/Button';

export default function NotificationComp() {
  return (
    <div className='flex'>
      <Button variant="slate" size="circle" className='relative p-3.5'>
        <Bell size={24}/>

        <div className='absolute top-0 right-0 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full -mt-1 -mr-1'>
          3
        </div>
      </Button>
    </div>
  )
}