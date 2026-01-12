import  { ShowPasswordProps } from '@/lib/interface/interface'
import { Eye, EyeOff } from "lucide-react";

export default function ShowPassword({ isShowPassword, setIsShowPassword } : ShowPasswordProps) {
  return (
    <div className="absolute flex items-center inset-y-0 right-3">
      <button
        className="cursor-pointer" 
        type="button" 
        onClick={() => setIsShowPassword(v => !v)}>
        {isShowPassword ? (
          <EyeOff />
        ) : (
          <Eye />
        )}
      </button>
    </div>
  )
}