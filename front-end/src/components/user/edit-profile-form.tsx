'use client'

import { useAuthStore } from "@/stores/auth.store"
import { useProfileImage } from "@/hooks/profile/useProfileImage"
import { useEditProfile } from "@/hooks/profile/useEditProfile"
import Image from "next/image"
import Button from "@/components/ui/button"
import { useUsername } from "@/hooks/profile/useUsername"
import CardLayout from "../layout/card-layout"
import { Input } from "../ui/input"
import { X } from "lucide-react"

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
    <CardLayout>
      <div className='flex flex-col justify-start w-full dark:text-main mb-5'>
        <h1 className='text-3xl font-semibold'>Edit profile</h1>
        <h1 className="text-slate">Edit your profile and username</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-5">
        {imageError && <p className="text-red-500 text-sm mt-2">{imageError}</p>}
        {submitError && <p className="text-red-500 text-sm mt-2">{submitError}</p>}
        {success && <p className="text-green-500 text-sm mt-2">บันทึกสำเร็จ</p>}

        <div className="relative">
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
          <Button 
            type="button"
            variant="danger" 
            onClick={cancelImage}
            className="absolute -top-1 -right-1 p-1.5">
            <X />
          </Button>
        </div>

        <div className="flex flex-col gap-5 w-full">
          <label htmlFor="username">Username</label>
          <div className="relative">
            <Input  
              id='username'
              className="w-full"
              type="text"
              placeholder='username'
              value={username}
              onChange={(e) => changeUsername(e.target.value)} />
            <div className="absolute inset-y-0 right-2 flex items-center">
              {/* <Button 
                type="button" 
                variant="danger" 
                onClick={cancelUsername}
                className="p-1.5"
                >
                <X />
              </Button> */}
              <p className="flex items-center justify-center cursor-pointer" onClick={cancelUsername}>
                <X size={20} />
              </p>
            </div>
          </div>
        </div>



        <Button 
          className="w-full"
          variant="dark-purple"
          type="submit" 
          onClick={handleSubmit} 
          disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save'}
        </Button>
      </form>
    </CardLayout>
  )
}