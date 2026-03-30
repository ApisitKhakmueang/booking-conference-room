import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useAuthStore } from '@/stores/auth.store'
import { UseEditProfileProps } from '@/utils/interface/interface'
import { useRouter } from 'next/dist/client/components/navigation'

export const useEditProfile = () => {
  const supabase = createClient()
  const { user, setUser } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

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

        // 🌟 จุดที่แก้ไข 1: เติม ?t=... ท้าย URL เพื่อบังคับให้บราวเซอร์รีเฟรชรูปใหม่ (Cache Busting)
        avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`
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

      // 1. อัปเดต user ในตาราง 'users' (Database)
      const { error: updateError } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id)

      if (updateError) {
        throw new Error(`Update failed: ${updateError.message}`)
      }

      // 🌟 จุดที่แก้ไข 2: อัปเดต Auth Token (user_metadata) เพื่อให้ useAuth อ่านข้อมูลใหม่ได้ทันที
      const { error: authError } = await supabase.auth.updateUser({
        data: updateData
      })

      if (authError) {
        // ใช้แค่ console.error เพราะข้อมูลลง Database ไปแล้ว ไม่จำเป็นต้องทำให้แอปพัง
        console.error(`Auth update failed: ${authError.message}`) 
      }

      // 3. อัปเดต local store (Zustand) ให้ UI เปลี่ยนทันที
      const updatedUser = {
        ...user,
        ...(username !== originalUsername && { name: username }),
        ...(profileFile && { avatar: avatarUrl }),
      }

      setUser(updatedUser)
      setSuccess(true)
      
      router.push('/dashboard') // เปลี่ยนเส้นทางหลังจากอัปเดตสำเร็จ
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