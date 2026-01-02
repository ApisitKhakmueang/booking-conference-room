import { useEffect, useState } from 'react'
import { UseProfileImageReturn } from '@/lib/interface/interface'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export function useProfileImage(initialAvatar?: string): UseProfileImageReturn {
  const [profileFile, setProfileFile] = useState<File | null>(null)
  const [previewProfile, setPreviewProfile] = useState<string>(
    initialAvatar || '/userIcon/blank-profile.jpg'
  )
  const [prevBlobUrl, setPrevBlobUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'อนุญาตเฉพาะไฟล์ JPG, PNG, WebP เท่านั้น'
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'ขนาดไฟล์ต้องไม่เกิน 5MB'
    }
    return null
  }

  const changeProfile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      setProfileFile(null)
      return
    }

    setError(null)
    setProfileFile(file)
    const previewUrl = URL.createObjectURL(file)

    // Cleanup old blob URL
    if (prevBlobUrl) {
      URL.revokeObjectURL(prevBlobUrl)
    }

    setPrevBlobUrl(previewUrl)
    setPreviewProfile(previewUrl)
  }

  const cancelImage = () => {
    const previewUrl = initialAvatar || '/userIcon/blank-profile.jpg'
    setPreviewProfile(previewUrl)
    setProfileFile(null)
  }

  // Update preview when initialAvatar changes
  useEffect(() => {
    if (initialAvatar) {
      setPreviewProfile(initialAvatar)
    }
  }, [initialAvatar])

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (prevBlobUrl) {
        URL.revokeObjectURL(prevBlobUrl)
      }
    }
  }, [prevBlobUrl])

  return {
    profileFile,
    previewProfile,
    error,
    changeProfile,
    setPreviewProfile,
    cancelImage
  }
}
