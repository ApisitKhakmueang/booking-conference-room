import { useSignout } from "@/src/hooks/ui/useSignout"
import Button from "../ui/Button/Button"

export default function UserDetail() {
  return (
    <div className="cursor-none bg-amber-300 p-5 rounded-lg">
      <p>username</p>
      <p>email</p>
      <Button color="danger" onClick={useSignout} >
        Sign out
      </Button>
    </div>
  )
}