import { useSignout } from "@/src/hooks/ui/useSignout"
import Button from "../ui/Button/Button"
import { useAuthStore } from "@/src/stores/auth.store"
import Image from "next/image"

export default function UserDetail() {
  const user = useAuthStore((s) => s.user)

  return (
    <div className="cursor-none p-5 rounded-lg flex flex-col justify-center gap-2 bg-white shadow-lg">
      <div className="w-full flex justify-center">
        <Image
          src={user?.avatar || '/userIcon/blank-profile.jpg'}
          alt={user?.email || 'User avatar'}
          width={120}
          height={120}
          className="rounded-full object-cover"
        />
      </div>
      <p>{user?.name}</p>
      <p>{user?.email}</p>
      <Button variant='danger' onClick={useSignout} className="my-2" >
        Sign out
      </Button>
    </div>
  )
}