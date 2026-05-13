import { UseUsernameProps } from "@/utils/interface/interface"
import { useState } from "react"

export function useUsername(initialUsername?: string): UseUsernameProps {
  const [ username, setUsername ] = useState<string>(initialUsername || '')

  const changeUsername = (username: string) => {
    setUsername(username)
  }

  const cancelUsername = () => {
    setUsername(initialUsername || '')
  }

  return {
    username,
    changeUsername,
    cancelUsername
  }
}