import Button from "../../ui/button/button"
import { useAuthStore } from "@/stores/auth.store"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { profile } from "@/lib/utils"
import { useSignout } from "@/hooks/auth/useSignout"

export default function UserDetail() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)

  return (
    <div className="cursor-none p-5 rounded-lg flex flex-col justify-center gap-2 dark:bg-sidebar bg-white shadow-lg">
      <div className="w-full flex justify-center">
        <div className="w-30 h-30 relative flex">
          <Image
            src={user?.avatar || profile}
            alt={user?.email || 'User avatar'}
            fill
            className="rounded-full object-cover"
          />
        </div>
      </div>
      <p>{user?.name}</p>
      <p>{user?.email}</p>

      <div className="flex flex-col gap-2 my-2">
        <Button variant="primary" onClick={() => router.push('/user/edit-profile')} className="dark:bg-card dark:hover:bg-hover">
          Edit Profile
        </Button>

        <Button variant='danger' onClick={useSignout}>
          Sign out
        </Button>
      </div>
    </div>
  )
}