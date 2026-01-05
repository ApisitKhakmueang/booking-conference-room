import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/auth.store'

interface UseEditProfileProps {
  username: string
  profileFile: File | null
  originalUsername?: string
  originalAvatar?: string
}

export const useEditProfile = () => {
  const supabase = createClient()
  const { user, setUser } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const submit = async (props: UseEditProfileProps) => {
    const { username, profileFile, originalUsername, originalAvatar } = props

    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      if (!user) {
        throw new Error('User not found')
      }

      let avatarUrl = originalAvatar

      // อัปโหลดรูปถ้ามีไฟล์ใหม่
      if (profileFile) {
        const fileName = `${user.id}/avatar.jpg`
        
        const { error: uploadError, data } = await supabase.storage
          .from('avatars')
          .upload(fileName, profileFile, {
            upsert: true,
          })

        if (uploadError) {
          throw new Error(`Upload failed: ${uploadError.message}`)
        }

        // ดึง public URL
        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName)

        avatarUrl = urlData.publicUrl
      }

      // เตรียมข้อมูลที่จะอัปเดต
      const updateData: Record<string, any> = {}

      // เพิ่ม username ถ้าเปลี่ยน
      if (username !== originalUsername) {
        updateData.full_name = username
      }

      // เพิ่ม avatar ถ้ามีรูปใหม่
      if (profileFile) {
        updateData.avatar_url = avatarUrl
      }

      // ถ้าไม่มีอะไรเปลี่ยน
      if (Object.keys(updateData).length === 0) {
        setSuccess(true)
        setError(null)
        setIsLoading(false)
        return
      }

      // อัปเดต user ใน Supabase
      const { error: updateError } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id)

      if (updateError) {
        throw new Error(`Update failed: ${updateError.message}`)
      }

      // อัปเดต local store
      const updatedUser = {
        ...user,
        ...(username !== originalUsername && { name: username }),
        ...(profileFile && { avatar: avatarUrl }),
      }

      setUser(updatedUser)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setSuccess(false)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    submit,
    isLoading,
    error,
    success,
  }
}
