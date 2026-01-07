import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import photo from '../../public/user/profile.jpg'
import logo_color from '../../public/logo/logoEE-color.png'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const profile = photo
export const logoColor = logo_color

// This check can be removed, it is just for tutorial purposes
export const hasEnvVars =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
