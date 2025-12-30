import { useSignout } from "@/src/hooks/ui/useSignout"
import Button from "../ui/Button/Button"
import { useAuthStore } from "@/src/stores/auth.store"
import Image from "next/image"
import { useRouter } from "next/navigation"

export default function UserDetail() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)

  return (
    <div className="cursor-none p-5 rounded-lg flex flex-col justify-center gap-2 bg-white shadow-lg">
      <div className="w-full flex justify-center">
        <div className="w-30 h-30 relative flex">
          <Image
            src={user?.avatar || '/userIcon/blank-profile.jpg'}
            alt={user?.email || 'User avatar'}
            fill
            className="rounded-full object-cover"
          />
        </div>
      </div>
      <p>{user?.name}</p>
      <p>{user?.email}</p>

      <div className="flex flex-col gap-2 my-2">
        <Button variant="primary" onClick={() => router.push('/user/edit-profile')}>
          Edit Profile
        </Button>

        <Button variant='danger' onClick={useSignout}>
          Sign out
        </Button>
      </div>
    </div>
  )
}