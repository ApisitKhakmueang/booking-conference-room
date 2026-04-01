import { useAuthStore } from "@/stores/auth.store"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { UserButtonProps } from "@/utils/interface/interface"
import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/auth"

export default function UserDetail() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)

  const UserButton: UserButtonProps[] = [
    {
      name: 'Edit Profile',
      onClick: () => router.push('/user/edit-profile'),
      variant: 'purple'
    },
    {
      name: 'Update Password',
      onClick: () => router.push('/user/update-password'),
      variant: 'purple'
    },
    {
      name: 'Sign out',
      onClick: signOut,
      variant: 'danger'
    }
  ]

  return (
    // 🌟 3. เอา cursor-none ออก
    <div className="p-6 rounded-2xl flex flex-col items-center justify-center gap-2 dark:bg-sidebar bg-white border border-gray-100 dark:border-white/10 shadow-xl min-w-[250px]">
      
      <div className="w-full flex justify-center mb-2">
        {/* 🌟 4. แก้ขนาดรูปให้เป็นมาตรฐาน Tailwind */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 relative flex drop-shadow-md">
          <Image
            src={user?.avatar || '/user/profile.jpg'}
            alt={user?.email || 'User avatar'}
            fill
            className="rounded-full object-cover border-4 border-white dark:border-sidebar"
          />
        </div>
      </div>
      
      {/* 🌟 5. จัดตัวหนังสือให้อยู่ตรงกลาง และเพิ่มความต่างของสี */}
      <div className="text-center w-full">
        <p className="text-lg font-bold text-gray-800 dark:text-white truncate px-2">
          {user?.name || "Unknown User"}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate px-2">
          {user?.email || "No email provided"}
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full mt-4">
        {UserButton.map((button, index) => (
          <Button 
            key={index}
            variant={button.variant} 
            onClick={button.onClick}
            // 🌟 ให้ปุ่มกว้างเต็มพื้นที่ (w-full) จะดูเป็นระเบียบกว่า
            className="w-full whitespace-nowrap shadow-sm">
            {button.name}
          </Button>
        ))}
      </div>
    </div>
  )
}