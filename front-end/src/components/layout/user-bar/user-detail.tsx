import { useAuthStore } from "@/stores/auth.store"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useSignout } from "@/hooks/auth/useSignout"
import { UserButtonProps } from "@/utils/interface/interface"
import { Button } from "@/components/ui/button"

export default function UserDetail() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)

  const UserButton: UserButtonProps[] = [
    {
      name: 'Edit Profile',
      onClick: () => router.push('/user/edit-profile'),
      variant: 'dark-purple'
    },
    {
      name: 'Update Password',
      onClick: () => router.push('/user/update-password'),
      variant: 'dark-purple'
    },
    {
      name: 'Sign out',
      onClick: useSignout,
      variant: 'danger'
    }
  ]

  return (
    <div className="cursor-none p-5 rounded-lg flex flex-col justify-center gap-2 dark:bg-sidebar bg-light-main-background shadow-lg">
      <div className="w-full flex justify-center">
        <div className="w-30 h-30 relative flex">
          <Image
            src={user?.avatar || '/user/profile.jpg'}
            alt={user?.email || 'User avatar'}
            fill
            className="rounded-full object-cover"
          />
        </div>
      </div>
      <p>{user?.name}</p>
      <p>{user?.email}</p>

      <div className="flex flex-col gap-3 my-2">
        {UserButton.map((button, index) => (
          <Button 
            key={index}
            variant={button.variant} 
            onClick={button.onClick}
            className="whitespace-nowrap">
            {button.name}
          </Button>
        ))}
      </div>
    </div>
  )
}