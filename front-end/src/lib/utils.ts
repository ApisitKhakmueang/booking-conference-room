import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import photo from '../../public/user/profile.jpg'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const profile = photo

// This check can be removed, it is just for tutorial purposes
export const hasEnvVars =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
