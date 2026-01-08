'use client'

import { useAuthStore } from "@/stores/auth.store"
import { useProfileImage } from "@/hooks/profile/useProfileImage"
import { useEditProfile } from "@/hooks/profile/useEditProfile"
import Image from "next/image"
import Button from "@/components/ui/button"
import { useUsername } from "@/hooks/profile/useUsername"

export default function EditProfileForm() {
  const user = useAuthStore((s) => s.user)
  const { profileFile, previewProfile, error: imageError, changeProfile, cancelImage } = useProfileImage(user?.avatar)
  const { username, changeUsername, cancelUsername } = useUsername(user?.name)
  const { submit, isLoading, error: submitError, success } = useEditProfile()

  const handleSubmit = async () => {
    await submit({
      username,
      profileFile,
      originalUsername: user?.name,
      originalAvatar: user?.avatar,
    })
  }

  return (
    <>
      <input 
        type="text"
        placeholder='username'
        value={username}
        onChange={(e) => changeUsername(e.target.value)} />

      {imageError && <p className="text-red-500 text-sm mt-2">{imageError}</p>}
      {submitError && <p className="text-red-500 text-sm mt-2">{submitError}</p>}
      {success && <p className="text-green-500 text-sm mt-2">บันทึกสำเร็จ</p>}

      <label htmlFor="profile" className="relative w-35 h-35 flex">
        <Image 
          src={previewProfile || '/user/profile.jpg'}
          alt='preview profile'
          fill
          className="rounded-full cursor-pointer object-cover"/>
      </label>
      <input 
        id="profile"
        type="file" 
        name="profile" 
        accept=".jpg,.jpeg,.png,.webp"
        onChange={changeProfile}
        className='hidden'
      />
      <Button variant="danger" onClick={cancelImage}>
        Cancel image
      </Button>

      <Button variant="danger" onClick={cancelUsername}>
        Cancel username
      </Button>

      <Button onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? 'บันทึกข้อมูล...' : 'บันทึกข้อมูล'}
      </Button>
    </>
  )
}