import { cookies } from 'next/headers'
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import RealtimeGuard from '@/components/auth/realtime-guard';
import { createClient } from '@/utils/supabase/server';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Booking Room",
  description: "Booking conference room",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies()
  const theme = cookieStore.get('theme')?.value ?? 'dark'
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  return (
    <html lang="en" className={`${theme} dark:bg-main-background bg-light-main-background`}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <RealtimeGuard userId={session?.user?.id} />
        {children}
      </body>
    </html>
  );
}
