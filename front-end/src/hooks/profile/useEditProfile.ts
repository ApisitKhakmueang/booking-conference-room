import { useState } from 'react'
import { supabase } from '@/src/lib/supabase/client'
import { useAuthStore } from '@/src/stores/auth.store'

interface UseEditProfileProps {
  username: string
  profileFile: File | null
  originalUsername?: string
  originalAvatar?: string
}

export const useEditProfile = () => {
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
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
        // ตรวจสอบ user auth
        // const { data: { user: authUser } } = await supabase.auth.getUser()
        // if (!authUser) {
        //   throw new Error('User not authenticated')
        // }

        // ลบรูปเก่าถ้ามี
        // if (originalAvatar) {
        //   try {
        //     // แยก filename จาก URL
        //     const oldFileName = originalAvatar.split('/').pop()
        //     if (oldFileName) {
        //       await supabase.storage
        //         .from('avatars')
        //         .remove([`${user.id}/${oldFileName}`])
        //       console.log('old avatar deleted:', oldFileName)
        //     }
        //   } catch (deleteError) {
        //     console.log('note: could not delete old avatar', deleteError)
        //     // ไม่ throw error ถ้าลบไม่ได้ เพราะไม่ใช่ critical
        //   }
        // }

        // user.id/avatar.jpg
        // const fileName = `${user.id}/avatar.${profileFile.name.split('.').pop()}`
        const fileName = `${user.id}/avatar.jpg`
        console.log('file name: ', fileName)
        console.log('file: ', profileFile)
        console.log('uploading with user:', user.id)
        
        const { error: uploadError, data } = await supabase.storage
          .from('avatars')
          .upload(fileName, profileFile, {
            upsert: true,
          })

        console.log('upload response:', { error: uploadError, data })

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
      if (profileFile && avatarUrl) {
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
